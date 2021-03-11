import { BuildingLocation } from "./BuildingLocation";

export default class Room {
    private vertexEntrances: number[];
    private roomNumber: string;
    private names: string[];
    // The center may not be the geometric center. It can be any point that represents the room.
    private center: BuildingLocation;
    private outline: [number, number][];

    constructor(vertexEntrances: number[], roomNumber: string, names: string[]=[],
        outline: [number, number][], center: BuildingLocation) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.center = center;
        this.outline = outline;
    }

    getEntrances(): number[] {
        return this.vertexEntrances;
    }

    getRoomNumber(): string {
        return this.roomNumber;
    }

    getNames(): string[] {
        return this.names;
    }

    getName(): string {
        const names = this.getNames();
        if (names.length > 0) {
            return `${names[0]} (${this.getRoomNumber()})`;
        }
        return this.getRoomNumber();
    }

    getShortName(): string {
        const names = this.getNames();
        if (names.length > 0) {
            return names[0];
        }
        return this.getRoomNumber();
    }

    getCenter(): BuildingLocation {
        return this.center;
    }

    getOutline(): [number, number][] {
        return this.outline;
    }
}