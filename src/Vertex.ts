export default class Vertex {
    private floor: number;
    private location: [number, number];
    private tags: string[];
    private room?: string;

    constructor(vertex: {
        floor: number,
        location: number[],
        tags?: string[],
        room?: string
    }) {
        this.floor = vertex.floor;
        this.location = [vertex.location[0], vertex.location[1]];
        this.tags = vertex.tags || [];
        this.room = vertex.room;
    }

    getLocation(): [number, number] {
        return this.location;
    }
}