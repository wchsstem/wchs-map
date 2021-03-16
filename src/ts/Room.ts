import { BuildingLocation } from "./BuildingLocation";
import { emergencyTags, infrastructureTags } from "./settings";

export default class Room {
    public readonly vertexEntrances: number[];
    public readonly roomNumber: string;
    public readonly names: string[];
    // The center may not be the geometric center. It can be any point that represents the room.
    public readonly center: BuildingLocation;
    public readonly outline: [number, number][];
    public readonly area: number;
    public readonly tags: string[];

    constructor(
        vertexEntrances: number[],
        roomNumber: string,
        names: string[],
        outline: [number, number][],
        center: BuildingLocation,
        area: number,
        tags: string[]
    ) {
        this.vertexEntrances = vertexEntrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.center = center;
        this.outline = outline;
        this.area = area;
        this.tags = tags;
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

    public estimateImportance(): number {
        return this.area + (100 * this.tags.filter(tag => tag !== "closed").length);
    }

    public isInfrastructure(): boolean {
        return this.tags.filter(tag => infrastructureTags.has(tag)).length !== 0;
    }

    public isEmergency(): boolean {
        return this.tags.filter(tag => emergencyTags.has(tag)).length !== 0;
    }
}