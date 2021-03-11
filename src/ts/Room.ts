import { BuildingLocation } from "./BuildingLocation";

export default class Room {
    public readonly vertexEntrances: number[];
    public readonly roomNumber: string;
    public readonly names: string[];
    // The center may not be the geometric center. It can be any point that represents the room.
    public readonly center: BuildingLocation;
    public readonly outline: [number, number][];
    public readonly area: number;

    constructor(
        vertexEntrances: number[],
        roomNumber: string,
        names: string[],
        outline: [number, number][],
        center: BuildingLocation,
        area: number
    ) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.center = center;
        this.outline = outline;
        this.area = area;
    }

    getName(): string {
        const names = this.names;
        if (names.length > 0) {
            return `${names[0]} (${this.roomNumber})`;
        }
        return this.roomNumber;
    }

    getShortName(): string {
        const names = this.names;
        if (names.length > 0) {
            return names[0];
        }
        return this.roomNumber;
    }
}