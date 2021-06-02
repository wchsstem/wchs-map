import { Option, Some, None } from "@nvarner/monads";
import { LatLng } from "leaflet";

export class BuildingLocation {
    constructor(private readonly xy: LatLng, private readonly floor: string) {}

    public getXY(): LatLng {
        return this.xy;
    }

    public getFloor(): string {
        return this.floor;
    }

    public distanceTo(other: BuildingLocation): Option<number> {
        if (this.floor === other.floor) {
            const dlat = other.xy.lat - this.xy.lat;
            const dlng = other.xy.lng - this.xy.lng;
            return Some(Math.sqrt((dlat * dlat) + (dlng * dlng)));
        } else {
            return None;
        }
    }

    public distance2To(other: BuildingLocation): Option<number> {
        if (this.floor === other.floor) {
            const dlat = other.xy.lat - this.xy.lat;
            const dlng = other.xy.lng - this.xy.lng;
            return Some((dlat * dlat) + (dlng * dlng));
        } else {
            return None;
        }
    }
}

/**
 * Represents a building location with entrance(s) that may be distinct from its center point.
 */
export class BuildingLocationWithEntrances extends BuildingLocation {
    private readonly entrances: BuildingLocation[];

    /**
     * @param center Single point that represents the location, usually its center. Used as the only entrance iff there
     * are no provided entrances.
     * @param entrances Location of entrance(s). If any are specified, the center is not treated as an entrance unless
     * it is included in this list. If none are specified, the center is treated as the only entrance.
     */
    constructor(center: BuildingLocation, entrances: BuildingLocation[]) {
        super(center.getXY(), center.getFloor());
        this.entrances = entrances;
    }

    public getEntrances(): BuildingLocation[] {
        // Use the room's center as the entrance if we don't have an actual entrance
        if (this.entrances.length === 0) {
            return [this];
        }
        return this.entrances;
    }
}
