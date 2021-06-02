import { BuildingLocation, BuildingLocationWithEntrances } from "./BuildingLocation";
import { DefinitionTag, GeocoderDefinition } from "./Geocoder";
import { EMERGENCY_TAGS, INFRASTRUCTURE_TAGS } from "./config";
import { deepCopy } from "./utils";

export default class Room implements GeocoderDefinition {
    public constructor(
        public readonly entrances: BuildingLocation[],
        public readonly roomNumber: string,
        public readonly names: string[],
        public readonly outline: [number, number][],
        /** The center may not be the geometric center. It can be any point that represents the room. */
        public readonly center: BuildingLocation,
        public readonly area: number,
        public readonly tags: DefinitionTag[]
    ) {}

    /**
     * Displayed to the user and the main factor in search. Must be unique among rooms.
     */
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

    /*
     * Not displayed to the user, but used in search.
     */
    public getAlternateNames(): string[] {
        return this.names;
    }

    /**
     * Returns a new definition with an extra alternate name added. Does not modify the object on which it is called.
     */
    public extendedWithAlternateName(name: string): Room {
        const extended = deepCopy(this);
        extended.names.push(name);
        return extended;
    }

    /**
     * Displayed to the user and used in search.
     */
    public getDescription(): string {
        return "";
    }

    /**
     * May be displayed to the user and used in search.
     */
    public getTags(): DefinitionTag[] {
        return this.tags;
    }

    public hasTag(tag: DefinitionTag): boolean {
        return this.tags.includes(tag);
    }

    public getEntranceLocations(): BuildingLocation[] {
        return this.entrances;
    }
    
    public getLocation(): BuildingLocationWithEntrances {
        return new BuildingLocationWithEntrances(this.center, this.entrances);
    }

    public estimateImportance(): number {
        return this.area + (100 * this.tags.filter(tag => tag !== DefinitionTag.Closed).length);
    }

    public isInfrastructure(): boolean {
        return this.tags.filter(tag => INFRASTRUCTURE_TAGS.has(tag)).length !== 0;
    }

    public isEmergency(): boolean {
        return this.tags.filter(tag => EMERGENCY_TAGS.has(tag)).length !== 0;
    }

    public isClosed(): boolean {
        return this.tags.includes(DefinitionTag.Closed);
    }
}
