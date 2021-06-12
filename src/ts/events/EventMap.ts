import { BuildingLocation } from "../BuildingLocation/BuildingLocation";
import { GeocoderDefinition } from "../Geocoder/GeocoderDefinition";
import { GeocoderSuggestion } from "../Geocoder/GeocoderSuggestion";

export interface EventMap {
    clickNavigateFromSuggestion: (suggestion: GeocoderSuggestion) => void;
    clickNavigateToSuggestion: (suggestion: GeocoderSuggestion) => void;
    swapNav: () => void;
    dragFromPin: (movedTo: BuildingLocation) => void;
    dragToPin: (movedTo: BuildingLocation) => void;
    clickResult: (result: GeocoderSuggestion) => void;
    clickClosestButton: (
        closestDefinition: GeocoderDefinition,
        starting: BuildingLocation,
    ) => void;
    clickNavigateToDefinitionButton: (definition: GeocoderDefinition) => void;
    clickFocusDefinitionButton: (definition: GeocoderDefinition) => void;
}
