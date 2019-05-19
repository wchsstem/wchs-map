export default class Room {
    private vertexEntrances: number[];
    private roomNumber: string;
    private names: string[];
    private center: [number, number] | undefined;

    constructor(vertexEntrances: number[], roomNumber: string, names: string[]=[],
        center: [number, number] | undefined=undefined) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.center = center;
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

    getCenter(): [number, number] {
        return this.center;
    }
}