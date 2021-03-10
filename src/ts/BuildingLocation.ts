import { Option, Some, None } from "@nvarner/monads";
import { LatLng } from "leaflet";
import { Geocoder, GeocoderDefinition, GeocoderLocation } from "./Geocoder";

export class BuildingLocation implements GeocoderLocation {
    public readonly xy: LatLng;
    public readonly floor: string;

    constructor(xy: LatLng, floor: string) {
        this.xy = xy;
        this.floor = floor;
    }

    /**
     * Calculates the Euclidean distance to the given location. If this location and the given one are not
     * on the same floor, `None` is returned instead of a distance.
     * @param other Location to calculate the distance to
     * @returns `Some(distance)` if they are on the same floor, `None` if they are not
     */
    public distanceTo(other: GeocoderLocation): Option<number> {
        if (!(other instanceof BuildingLocation)) {
            return None;
        }
        if (this.floor !== other.floor) {
            return None;
        }

        const dx = this.xy.lat - other.xy.lat;
        const dy = this.xy.lng - other.xy.lng;
        return Some(Math.sqrt((dx * dx) + (dy * dy)));
    }
}

/**
 * Represents a building location that has (an) entrance(s) that may be distinct from its center point.
 */
export class BuildingLocationWithEntrances implements GeocoderLocation {
    private center: BuildingLocation;
    private entrances: BuildingLocation[];

    /**
     * @param center Single point that represents the location, usually its center. Used as the only entrance iff there
     * are no provided entrances.
     * @param entrances Location of entrance(s). If any are specified, the center is not treated as an entrance unless
     * it is included in this list.
     */
    constructor(center: BuildingLocation, entrances: BuildingLocation[]) {
        this.center = center;
        this.entrances = entrances;
    }

    public getCenter(): BuildingLocation {
        return this.center;
    }

    public getEntrances(): BuildingLocation[] {
        if (this.entrances.length === 0) {
            return [this.center];
        }
        return this.entrances;
    }

    public distanceTo(other: GeocoderLocation): Option<number> {
        if (!(other instanceof BuildingLocationWithEntrances)) {
            return None;
        }
        return this.getCenter().distanceTo(other.getCenter());
    }
}

export type BuildingGeocoder = Geocoder<BuildingLocationWithEntrances>;
export type BuildingGeocoderDefinition = GeocoderDefinition<BuildingLocationWithEntrances>;
