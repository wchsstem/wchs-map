import { BuildingLocationWithEntrances } from "./BuildingLocation";
import { DefinitionTag, GeocoderDefinition } from "./Geocoder";
import { deepCopy } from "./utils";

export class LocationOnlyDefinition implements GeocoderDefinition {
    private readonly location: BuildingLocationWithEntrances;

    public constructor(location: BuildingLocationWithEntrances) {
        this.location = location;
    }
    
    public getLocation(): BuildingLocationWithEntrances {
        return this.location;
    }

    public getName(): string {
        return "";
    }
    public getAlternateNames(): string[] {
        return [];
    }
    public getDescription(): string {
        return "";
    }
    public getTags(): DefinitionTag[] {
        return [];
    }
    public hasTag(tag: DefinitionTag): boolean {
        return false;
    }

    // TODO: Better implementation
    public extendedWithAlternateName(name: string): GeocoderDefinition {
        return deepCopy(this);
    }
}