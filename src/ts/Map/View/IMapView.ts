import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";
import { GeocoderSuggestion } from "../../Geocoder/GeocoderSuggestion";
import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { LSomeLayerWithFloor } from "../../LFloorsPlugin/LFloorsPlugin";
import { Option } from "@nvarner/monads";

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

    /**
     * Register a callback for when a definition is focused
     * @param onFocusDefinition The callback, which takes in the definition being focused
     */
    registerOnFocusDefinition(onFocusDefinition: (definition: IGeocoderDefinition) => void): void;

    /**
     * Register a callback for when the source and destination of the navigation are swapped
     * @param onSwap The callback
     */
    registerOnSwapNav(onSwap: () => void): void;

    /**
     * Register a callback for when the user navigates to a definition
     * @param onNavigateTo The callback, which takes in the definition the user navigated to
     */
    registerOnNavigateTo(onNavigateTo: (definition: Option<IGeocoderDefinition>) => void): void;

    /**
     * Register a callback for when the user navigates from a definition
     * @param onNavigateFrom The callback, which takes in the definition the user navigated from
     */
    registerOnNavigateFrom(onNavigateFrom: (definition: Option<IGeocoderDefinition>) => void): void;

    /**
     * Register a callback for when the navigation pin representing the starting location is moved
     * @param onMove The callback, which takes in the current position of the pin
     */
    registerOnMoveFromPin(onMove: (currentLocation: BuildingLocation) => void): void;

    /**
     * Register a callback for when the navigation pin representing the destination is moved
     * @param onMove The callback, which takes in the current position of the pin
     */
    registerOnMoveToPin(onMove: (currentLocation: BuildingLocation) => void): void;

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    setSnapPinHandler(snapPin: (location: BuildingLocation) => BuildingLocation): void;

    /** Move the map's focus to a definition and display info about it */
    focusOnDefinition(definition: IGeocoderDefinition): void;

    /** Remove routing data from the map */
    clearNav(): void;

    /** Display given navigation route */
    displayNav(layers: Set<LSomeLayerWithFloor>): void;
}