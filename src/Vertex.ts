import { LatLng } from "leaflet";
import { BuildingLocation } from "./ts/BuildingLocation";

export default class Vertex {
    private location: BuildingLocation;
    private tags: string[];

    constructor(vertex: {
        floor: string,
        location: number[],
        tags?: string[]
    }) {
        this.location = new BuildingLocation(new LatLng(vertex.location[1], vertex.location[0]), vertex.floor);
        this.tags = vertex.tags || [];
    }

    getLocation(): BuildingLocation {
        return this.location;
    }

    hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }
    
    getTags(): string[] {
        return this.tags;
    }
}