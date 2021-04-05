import { Option, fromMap, Some, None } from "@nvarner/monads";
import { kdTree } from "kd-tree-javascript";
import MiniSearch from "minisearch";
import { BuildingLocationWithEntrances } from "./BuildingLocation";
import Room from "./Room";

export class GeocoderSuggestion {
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export interface GeocoderDefinition {
    /**
     * Displayed to the user and the main factor in search. Must be unique among definitions.
     */
    getName(): string;

    /*
     * Not displayed to the user, but used in search.
     */
    getAlternateNames(): string[];

    /**
     * Displayed to the user and used in search.
     */
    getDescription(): string;

    /**
     * May be displayed to the user and used in search.
     */
    getTags(): string[];

    /**
     * Returns a new definition with an extra alternate name added. Does not modify the object on which it is called.
     */
    extendedWithAlternateName(name: string): GeocoderDefinition;

    getLocation(): BuildingLocationWithEntrances;
}

export class Geocoder {
    private readonly search: MiniSearch;
    private readonly definitionsByName: Map<string, GeocoderDefinition>;
    /**
     * Definitions indexed by alternate names. They are not guaranteed to be unique, so some definitions may be
     * overwritten. This should be used as a backup only if `definitionsByName` does not contain a requested name.
     */
    private readonly definitionsByAltName: Map<string, GeocoderDefinition>;
    private readonly definitionsByLocation: Map<BuildingLocationWithEntrances, GeocoderDefinition>;
    private readonly allNames: Set<string>;
    /** Spatial indices of room center locations, indexed by floor */
    private readonly roomCenterIndices: Map<string, BuildingKDTree>;

    constructor() {
        this.search = new MiniSearch({
            idField: "getName",
            fields: ["getName", "getAlternateNames", "getDescription", "getTags"],
            storeFields: ["getName"],
            // Call the function instead of getting the value of a field
            extractField: (definition, fieldName) => definition[fieldName](),
            searchOptions: {
                prefix: true,
                boost: {
                    name: 2
                }
            }
        });
        this.definitionsByName = new Map();
        this.definitionsByAltName = new Map();
        this.definitionsByLocation = new Map();
        this.allNames = new Set();
        this.roomCenterIndices = new Map();
    }

    /**
     * Adds a definition to the geocoder. Overrides any other definition with the same name, if already added to the
     * geocoder. Returns the definition it replaced, if any.
     */
    public addDefinition(definition: GeocoderDefinition): Option<GeocoderDefinition> {
        // Deal with the existing definition if it exists
        const existing = fromMap(this.definitionsByName, definition.getName())
            .map(existing => {
                this.removeDefinition(existing);
                return existing;
            });

        this.definitionsByName.set(definition.getName(), definition);
        definition.getAlternateNames().forEach(altName => this.definitionsByAltName.set(altName, definition));
        this.definitionsByLocation.set(definition.getLocation(), definition);
        this.allNames.add(definition.getName());
        this.search.add(definition);

        const floor = definition.getLocation().getFloor();

        this.updateTree(floor, tree => {
            tree.insert(definitionToKDTreeEntry(definition));
            return tree;
        });

        return existing;
    }

    public removeDefinition(definition: GeocoderDefinition): void {
        this.definitionsByName.delete(definition.getName());

        const newDefinitionsByAltName = [...this.definitionsByAltName]
            .filter(([checkingName, checkingDefinition]) => {
                return !definition.getAlternateNames().includes(checkingName) && definition !== checkingDefinition;
            });
        this.definitionsByAltName.clear();
        for (const [name, definition] of newDefinitionsByAltName) {
            this.definitionsByAltName.set(name, definition);
        }

        this.definitionsByLocation.delete(definition.getLocation());

        this.allNames.delete(definition.getName());

        this.search.remove(definition);

        this.updateTree(definition.getLocation().getFloor(), tree => {
            tree.remove(definitionToKDTreeEntry(definition));
            return tree;
        });
    }

    public getSuggestionsFrom(query: string): GeocoderSuggestion[] {
        return this.search.search(query)
            // .getName here is a field, not a method, so named because of how minisearch works
            .map(searchResult => new GeocoderSuggestion(searchResult.getName));
    }

    public getDefinitionFromName(name: string): Option<GeocoderDefinition> {
        return fromMap(this.definitionsByName, name)
            .or(fromMap(this.definitionsByAltName, name));
    }

    public updateTree(floor: string, f: (tree: BuildingKDTree) => BuildingKDTree): void {
        const tree = fromMap(this.roomCenterIndices, floor)
            .unwrapOr(new kdTree([], distanceBetween, ["x", "y"]));
        this.roomCenterIndices.set(floor, f(tree));
    }

    public getClosestDefinition(location: BuildingLocationWithEntrances): Option<GeocoderDefinition> {
        const tree = fromMap(this.roomCenterIndices, location.getFloor()).unwrap();
        const [closest] = tree.nearest(locationToKDTreeEntry(location), 1);
        return closest[0].definition;
    }
}

interface KDTreeEntry {
    x: number,
    y: number,
    definition: Option<GeocoderDefinition>
}
type BuildingKDTree = kdTree<KDTreeEntry>;

function definitionToKDTreeEntry(definition: GeocoderDefinition): KDTreeEntry {
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
