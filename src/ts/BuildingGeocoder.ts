import { BuildingLocationWithEntrances } from "./BuildingLocation";
import { Geocoder } from "./Geocoder";
import Room from "./Room";

import { fromMap, None, Option, Some } from "@nvarner/monads";
import { kdTree } from "kd-tree-javascript";

export class BuildingGeocoder extends Geocoder<BuildingLocationWithEntrances, Room> {
    /** Spatial indices of room center locations, indexed by floor */
    private readonly roomCenterIndices: Map<string, BuildingKDTree>;

    public constructor() {
        super();
        this.roomCenterIndices = new Map();
    }

    public addDefinition(definition: Room): Option<Room> {
        const existing = super.addDefinition(definition);

        const floor = definition.getLocation().getFloor();

        this.updateTree(floor, tree => {
            tree.insert(definitionToKDTreeEntry(definition));
            return tree;
        });

        return existing;
    }

    public removeDefinition(definition: Room): void {
        const floor = definition.getLocation().getFloor();

        this.updateTree(floor, tree => {
            tree.remove(definitionToKDTreeEntry(definition));
            return tree;
        });
    }

    public updateTree(floor: string, f: (tree: BuildingKDTree) => BuildingKDTree): void {
        const tree = fromMap(this.roomCenterIndices, floor)
            .unwrapOr(new kdTree([], distanceBetween, ["x", "y"]));
        this.roomCenterIndices.set(floor, f(tree));
    }

    public getClosestDefinition(location: BuildingLocationWithEntrances): Room {
        const tree = fromMap(this.roomCenterIndices, location.getFloor()).unwrap();
        const [closest] = tree.nearest(locationToKDTreeEntry(location), 1);
        return closest[0].definition.unwrap();
    }
}

interface KDTreeEntry {
    x: number,
    y: number,
    definition: Option<Room>
}
type BuildingKDTree = kdTree<KDTreeEntry>;

function definitionToKDTreeEntry(definition: Room): KDTreeEntry {
    const location = definition.getLocation().getXY();
    return {
        x: location.lng,
        y: location.lat,
        definition: Some(definition)
    };
}

function locationToKDTreeEntry(location: BuildingLocationWithEntrances): KDTreeEntry {
    const xy = location.getXY();
    return {
        x: xy.lng,
        y: xy.lat,
        definition: None
    }
}

function distanceBetween(a: KDTreeEntry, b: KDTreeEntry): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt((dx * dx) + (dy * dy));
}
