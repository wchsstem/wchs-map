import { titleCap } from "./utils";

export default class Room {
    private vertexEntrances: number[];
    private roomNumber: string;
    private floorNumber: string;
    private names: string[];
    // The center may not be the geometric center. It can be any point that represents the room.
    private center: [number, number];
    private outline: [number, number][];
    private numberMarker: L.Marker | undefined;

    constructor(vertexEntrances: number[], roomNumber: string, floorNumber: string, names: string[]=[],
        outline: [number, number][], center: [number, number]) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.floorNumber = floorNumber;
        this.names = names;
        this.center = center;
        this.numberMarker = undefined;
        this.outline = outline;
    }

    setNumberMarker(numberMarker: L.Marker) {
        this.numberMarker = numberMarker;
    }

    getNumberMarker(): L.Marker {
        return this.numberMarker;
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
            return `${titleCap(names[0])} (${this.getRoomNumber()})`;
        }
        return this.getRoomNumber();
    }

    getShortName(): string {
        const names = this.getNames();
        if (names.length > 0) {
            return titleCap(names[0]);
        }
        return this.getRoomNumber();
    }

    getFloorNumber(): string {
        return this.floorNumber;
    }

    getCenter(): [number, number] {
        return this.center;
    }

    getOutline(): [number, number][] {
        return this.outline;
    }
}