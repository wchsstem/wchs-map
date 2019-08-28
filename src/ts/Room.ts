import { titleCap } from "./utils";

// TODO: Store floor number
export default class Room {
    private vertexEntrances: number[];
    private roomNumber: string;
    private names: string[];
    private namesAsString: string;
    // TODO: Set this equal to the position of an entrance if there is no center
    private center: [number, number] | undefined;
    private outline: [number, number][];
    // TODO: Is there a better way to do this?
    private numberMarker: L.Marker | undefined;

    constructor(vertexEntrances: number[], roomNumber: string, names: string[]=[], outline: [number, number][],
        center: [number, number] | undefined=undefined) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.namesAsString = JSON.stringify(this.names);
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

    getCenter(): [number, number] {
        return this.center;
    }

    getOutline(): [number, number][] {
        return this.outline;
    }
}