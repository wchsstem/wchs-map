import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { Option } from "@nvarner/monads";

export interface IMapController {
    /** Move the map's focus to a definition and display info about it */
    focusOnDefinition(definition: GeocoderDefinition): void;

    /** If there is a destination, and `definition` is not `None`, find and display the shortest path between them */
    navigateFrom(definition: Option<GeocoderDefinition>): void;

    /** If there is a source, and `definition` is not `None`, find and display the shortest path between them */
    navigateTo(definition: Option<GeocoderDefinition>): void;
}