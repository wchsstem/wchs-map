export default class Room {
    private vertexEntrances: number[];
    private roomNumber: string;
    private names: string[];
    private center: [number, number];

    constructor(vertexEntrances: number[], roomNumber: string, names: string[]=[]) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.center = [50, 50];
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
}