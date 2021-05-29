import { LatLng } from "leaflet";
import { BuildingLocation } from "./BuildingLocation";

/**
 * Represents a vertex in the map's navigation graph
 */
export class Vertex {
    private readonly location: BuildingLocation;
    private readonly tags: VertexTag[];

    public constructor(vertex: {
        floor: string,
        location: number[],
        tags?: VertexTag[]
    }) {
        this.location = new BuildingLocation(new LatLng(vertex.location[1], vertex.location[0]), vertex.floor);
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

/**
 * Tags which may be present on a vertex
 */
export enum VertexTag {
    /**
     * Vertex represents a staircase
     */
    Stairs = "stairs",
    /**
     * Vertex represents an elevator
     */
    Elevator = "elevator",
    /**
     * Vertex represents an up-only elevator
     */
    Up = "up",
    /**
     * Vertex represents a down-only elevator
     */
    Down = "down",
}
