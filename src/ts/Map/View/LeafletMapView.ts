import { Map as LMap } from "leaflet";

import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";
import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import {
    LFloors,
    LSomeLayerWithFloor,
} from "../../LFloorsPlugin/LFloorsPlugin";
import { MapView } from "./MapView";
import { Sidebar } from "./Sidebar/Sidebar";

export class LeafletMapView implements MapView {
    public static inject = ["map", "floors", "sidebar"] as const;
    public constructor(
        private readonly map: LMap,
        private readonly floors: LFloors,
        private readonly sidebar: Sidebar,
    ) {}

    public moveFromPin(location: BuildingLocation): void {
        this.sidebar.moveFromPin(location);
    }

    public moveToPin(location: BuildingLocation): void {
        this.sidebar.moveToPin(location);
    }

    public setNavigateFromInputContents(contents: string): void {
        this.sidebar.setNavigateFromInputContents(contents);
    }

    public setNavigateToInputContents(contents: string): void {
        this.sidebar.setNavigateToInputContents(contents);
    }

    /** Remove search suggestions from typing in the navigate from or to fields */
    public clearNavSuggestions(): void {
        this.sidebar.clearNavSuggestions();
    }

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    public setSnapPinHandler(
        snapPin: (location: BuildingLocation) => BuildingLocation,
    ): void {
        this.sidebar.setSnapPinHandler(snapPin);
    }

    private goToDefinition(definition: GeocoderDefinition): void {
        const location = definition.getLocation();
        this.map.fitBounds(
            definition.getBoundingBox().toLatLngBounds().pad(0.1),
        );
        this.floors.setFloor(location.getFloor());
    }

    public focusOnDefinition(definition: GeocoderDefinition): void {
        this.goToDefinition(definition);
        this.sidebar.openInfoFor(definition);
    }

    public clearNav(): void {
        this.sidebar.clearNav();
    }

    public displayNav(layers: Set<LSomeLayerWithFloor>): void {
        this.sidebar.displayNav(layers);
    }
}
