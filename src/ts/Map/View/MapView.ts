import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";
import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { LSomeLayerWithFloor } from "../../LFloorsPlugin/LFloorsPlugin";

/** Interface to interact with and manipulate the map GUI, including info boxes, search bars, and the map itself */
export interface MapView {
    /** Remove search suggestions from typing in the navigate from or to fields */
    clearNavSuggestions(): void;

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    setSnapPinHandler(
        snapPin: (location: BuildingLocation) => BuildingLocation,
    ): void;

    /** Move the map's focus to a location */
    goTo(location: BuildingLocation): void;

    /** Move the map's focus to a definition and display info about it */
    focusOnDefinition(definition: GeocoderDefinition): void;

    /** Remove routing data from the map */
    clearNav(): void;

    /** Display given navigation route */
    displayNav(layers: Set<LSomeLayerWithFloor>): void;

    /** Set the location of the from pin */
    moveFromPin(location: BuildingLocation): void;

    /** Set the location of the to pin */
    moveToPin(location: BuildingLocation): void;

    /** Set the contents of the "navigate from" text input */
    setNavigateFromInputContents(contents: string): void;

    /** Set the contents of the "navigate to" text input */
    setNavigateToInputContents(contents: string): void;
}
