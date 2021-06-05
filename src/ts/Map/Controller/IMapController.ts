import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { Option } from "@nvarner/monads";

export interface IMapController {
    /** Move the map's focus to a definition and display info about it */
    focusOnDefinition(definition: IGeocoderDefinition): void;

    /** If there is a destination, and `definition` is not `None`, find and display the shortest path between them */
    navigateFrom(definition: Option<IGeocoderDefinition>): void;

    /** If there is a source, and `definition` is not `None`, find and display the shortest path between them */
    navigateTo(definition: Option<IGeocoderDefinition>): void;
}