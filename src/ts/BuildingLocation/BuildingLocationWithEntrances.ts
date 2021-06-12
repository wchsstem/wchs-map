import { BuildingLocation } from "./BuildingLocation";

/**
 * Represents a building location with entrance(s) that may be distinct from its center point.
 */

export class BuildingLocationWithEntrances extends BuildingLocation {
    /**
     * @param center Single point that represents the location, usually its center. Used as the only entrance iff there
     * are no provided entrances.
     * @param entrances Location of entrance(s). If any are specified, the center is not treated as an entrance unless
     * it is included in this list. If none are specified, the center is treated as the only entrance.
     */
    public constructor(
        center: BuildingLocation,
        private readonly entrances: BuildingLocation[],
    ) {
        super(center.getXY(), center.getFloor());
    }

    public getEntrances(): BuildingLocation[] {
        // Use the room's center as the entrance if we don't have an actual entrance
        if (this.entrances.length === 0) {
            return [this];
        }
        return this.entrances;
    }
}
