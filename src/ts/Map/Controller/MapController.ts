import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { Option } from "@nvarner/monads";
import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";

export interface MapController {
    /** Move the map's focus to a definition and display info about it */
    focusOnDefinition(definition: GeocoderDefinition): void;

    /** If there is a destination, and `definition` is not `None`, find and display the shortest path between them */
    navigateFrom(definition: Option<GeocoderDefinition>, movePin: boolean): void;

    /** If there is a source, and `definition` is not `None`, find and display the shortest path between them */
    navigateTo(definition: Option<GeocoderDefinition>, movePin: boolean): void;

    /** Set the location of the from pin */
    moveFromPin(location: BuildingLocation): void;

    /** Set the location of the to pin */
    moveToPin(location: BuildingLocation): void;
}