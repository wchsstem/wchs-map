import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";
import { GeocoderSuggestion } from "../../Geocoder/GeocoderSuggestion";
import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { LSomeLayerWithFloor } from "../../LFloorsPlugin/LFloorsPlugin";

/** Interface to interact with and manipulate the map GUI, including info boxes, search bars, and the map itself */
export interface IMapView {
    /**
     * Register a callback for when a search result is clicked
     * @param onClickResult The callback, which takes in the suggestion corresponding to the clicked search result
     */
    registerOnClickSearchResult(onClickResult: (result: GeocoderSuggestion) => void): void;

    /**
     * Register a callback for when a closest <something. (eg. closest bathroom) button is clicked
     * @param onClickClosest The callback, which takes in the closest definition and the definition the user is starting
     * from
     */
    registerOnClickClosest(onClickClosest: (closest: IGeocoderDefinition, starting: BuildingLocation) => void): void;

    /** Move the map's focus to a definition and display info about it */
    focusOnDefinition(definition: IGeocoderDefinition): void;

    /** Remove routing data from the map */
    clearNav(): void;

    /** Display given navigation route */
    displayNav(layers: Set<LSomeLayerWithFloor>): void;
}