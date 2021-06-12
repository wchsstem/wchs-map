import { LatLng } from "leaflet";
import { BuildingLocation } from "./BuildingLocation/BuildingLocation";
import { JsonVertex } from "./MapData";

/**
 * Represents a vertex in the map's navigation graph
 */
export class Vertex {
    private readonly location: BuildingLocation;
    private readonly tags: VertexTag[];

    public constructor(vertex: JsonVertex) {
        this.location = new BuildingLocation(
            new LatLng(vertex.location[1], vertex.location[0]),
            vertex.floor,
        );
        this.tags = vertex.tags ?? [];
    }

    public getLocation(): BuildingLocation {
        return this.location;
    }

    public hasTag(tag: VertexTag): boolean {
        return this.tags.includes(tag);
    }

    public getTags(): VertexTag[] {
        return this.tags;
    }
}

/** Tag which may be present on a vertex */
export enum VertexTag {
    /** Vertex represents a staircase */
    Stairs = "stairs",
    /** Vertex represents an elevator */
    Elevator = "elevator",
    /** Vertex represents an up-only staircase */
    Up = "up",
    /** Vertex represents a down-only staircase */
    Down = "down",
}
