import { BuildingLocation, BuildingLocationWithEntrances } from "./BuildingLocation";
import { GeocoderDefinition } from "./Geocoder";
import MapData from "./MapData";
import { emergencyTags, infrastructureTags } from "./settings";
import { deepCopy } from "./utils";

export default class Room implements GeocoderDefinition<BuildingLocationWithEntrances> {
    public readonly entrances: BuildingLocation[];
    public readonly roomNumber: string;
    public readonly names: string[];
    // The center may not be the geometric center. It can be any point that represents the room.
    public readonly center: BuildingLocation;
    public readonly outline: [number, number][];
    public readonly area: number;
    public readonly tags: string[];

    constructor(
        entrances: BuildingLocation[],
        roomNumber: string,
        names: string[],
        outline: [number, number][],
        center: BuildingLocation,
        area: number,
        tags: string[]
    ) {
        this.entrances = entrances;
        this.roomNumber = roomNumber;
        this.names = names;
        this.center = center;
        this.outline = outline;
        this.area = area;
        this.tags = tags;
    }

    public getName(): string {
        const names = this.names;
        if (names.length > 0) {
            return `${names[0]} (${this.roomNumber})`;
        }
        return this.roomNumber;
    }

    public getShortName(): string {
        const names = this.names;
        if (names.length > 0) {
            return names[0];
        }
        return this.roomNumber;
    }

    public getAlternateNames(): string[] {
        return this.names;
    }

    /**
     * Returns a new Room with an extra alternate name added. Does not modify the object on which this is called.
     */
    public extendedWithAlternateName(name: string): Room {
        const extended = deepCopy(this);
        extended.names.push(name);
        return extended;
    }

    public getDescription(): string {
        return "";
    }

    public getTags(): string[] {
        return this.tags;
    }

    public getEntranceLocations(): BuildingLocation[] {
        return this.entrances;
    }
    
    public getLocation(): BuildingLocationWithEntrances {
        return new BuildingLocationWithEntrances(this.center, this.entrances);
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

    public isClosed(): boolean {
        return this.tags.includes("closed");
    }
}