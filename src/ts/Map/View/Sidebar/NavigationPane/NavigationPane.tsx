import { divIcon, Map } from "leaflet";

import { None, Option, Some } from "@nvarner/monads";

import { BuildingLocation } from "../../../../BuildingLocation/BuildingLocation";
import { genPaneElement } from "../../../../GenHtml/GenHtml";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { GeocoderSuggestion } from "../../../../Geocoder/GeocoderSuggestion";
import { h } from "../../../../JSX";
import {
    LFloors,
    LSomeLayerWithFloor,
} from "../../../../LFloorsPlugin/LFloorsPlugin";
import { Events } from "../../../../events/Events";
import { FaIcon } from "../../../../html/custom/FaIcon";
import { ResultClearer } from "../../../../html/custom/roomSearchBox/ResultClearer";
import { RoomSearchBox } from "../../../../html/custom/roomSearchBox/RoomSearchBox";
import { TextBoxWriter } from "../../../../html/custom/textBox/TextBoxWriter";
import { Pane } from "../Pane";
import { FlooredMarker, flooredMarker } from "./FlooredMarker";
import "./navigation-pane.scss";

export class NavigationPane extends Pane {
    private snapPinHandler: (location: BuildingLocation) => BuildingLocation;

    private pathLayers: Set<LSomeLayerWithFloor>;

    private readonly fromToResultClearer: ResultClearer;

    private fromPin: Option<FlooredMarker>;
    private toPin: Option<FlooredMarker>;

    private readonly fromInputWriter: TextBoxWriter;
    private readonly toInputWriter: TextBoxWriter;

    private readonly pane: HTMLElement;

    public static inject = ["floors", "map", "geocoder", "events"] as const;
    public constructor(
        private readonly floors: LFloors,
        private readonly map: Map,
        geocoder: Geocoder,
        private readonly events: Events,
    ) {
        super();

        this.snapPinHandler = (location) => location;

        this.pathLayers = new Set();

        this.fromToResultClearer = new ResultClearer();

        this.fromPin = None;
        this.toPin = None;

        const fromPinButton = (
            <a
                className="leaflet-style button"
                href="#"
                role="button"
                title="Choose starting point"
            >
                <FaIcon faClass="map-marker-alt" />
            </a>
        );
        this.fromInputWriter = new TextBoxWriter();

        const toPinButton = (
            <a
                className="leaflet-style button"
                href="#"
                role="button"
                title="Choose destination"
            >
                <i className="fas fa-flag-checkered" />
            </a>
        );
        this.toInputWriter = new TextBoxWriter();

        const swapToFrom = (
            <a
                className="leaflet-style button swap-button"
                href="#"
                role="button"
                title="Swap to/from"
            >
                <FaIcon faClass="exchange-alt" />
            </a>
        );

        const toFromContainer = (
            <div className="navigation-container">
                <div className="directions-container">
                    <div className="direction-container">
                        <label className="leaflet-style no-border">From</label>
                        {fromPinButton}
                        <RoomSearchBox
                            geocoder={geocoder}
                            resultIcon={<FaIcon faClass="location-arrow" />}
                            onChooseResult={(result: GeocoderSuggestion) => {
                                this.events.trigger(
                                    "clickNavigateFromSuggestion",
                                    result,
                                );
                            }}
                            searchBoxWriter={this.fromInputWriter}
                            resultClearer={this.fromToResultClearer}
                        />
                    </div>
                    <div className="direction-container">
                        <label className="leaflet-style no-border">To</label>
                        {toPinButton}
                        <RoomSearchBox
                            geocoder={geocoder}
                            resultIcon={<FaIcon faClass="location-arrow" />}
                            onChooseResult={(result: GeocoderSuggestion) => {
                                this.events.trigger(
                                    "clickNavigateToSuggestion",
                                    result,
                                );
                            }}
                            searchBoxWriter={this.toInputWriter}
                            resultClearer={this.fromToResultClearer}
                        />
                    </div>
                </div>
                {swapToFrom}
            </div>
        );

        this.pane = genPaneElement("Navigation", toFromContainer);

        fromPinButton.addEventListener("click", (_event) => {
            const pinLocation = new BuildingLocation(
                this.map.getCenter(),
                this.floors.getCurrentFloor(),
            );
            this.createFromPin(pinLocation);
        });
        toPinButton.addEventListener("click", (_event) => {
            const pinLocation = new BuildingLocation(
                this.map.getCenter(),
                this.floors.getCurrentFloor(),
            );
            this.createToPin(pinLocation);
        });

        swapToFrom.addEventListener("click", (_event) => this.swapNav());
    }

    public getPaneId(): string {
        return "nav";
    }

    public getPaneIconClass(): string {
        return "fa-location-arrow";
    }

    public getPaneTitle(): string {
        return "Navigation";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }

    private swapNav(): void {
        this.events.trigger("swapNav");
    }

    /**
     * Create and add the from pin, or delete and recreate it if it exists
     */
    private createFromPin(location: BuildingLocation, snap = true): void {
        this.fromPin.ifSome((pin) => {
            this.floors.removeLayer(pin);
        });

        const pin = this.genFromPin(location, snap);
        pin.addTo(this.floors);
        this.fromPin = Some(pin);
    }

    /**
     * Create and add the to pin, or delete and recreate it if it exists
     */
    private createToPin(location: BuildingLocation, snap = true): void {
        this.toPin.ifSome((pin) => {
            this.floors.removeLayer(pin);
        });

        const pin = this.genToPin(location, snap);
        pin.addTo(this.floors);
        this.toPin = Some(pin);
    }

    /** Remove search suggestions from typing in the navigate from or to fields */
    public clearNavSuggestions(): void {
        this.fromToResultClearer.clear();
    }

    public clearNav(): void {
        this.pathLayers.forEach((layer) => this.floors.removeLayer(layer));
    }

    public displayNav(layers: Set<LSomeLayerWithFloor>): void {
        this.pathLayers = layers;
        this.pathLayers.forEach((layer) => this.floors.addLayer(layer));
    }

    public moveFromPin(location: BuildingLocation, snap = true): void {
        this.createFromPin(location, snap);
    }

    public moveToPin(location: BuildingLocation, snap = true): void {
        this.createToPin(location, snap);
    }

    public setNavigateFromInputContents(contents: string): void {
        this.fromInputWriter.write(contents);
    }

    public setNavigateToInputContents(contents: string): void {
        this.toInputWriter.write(contents);
    }

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    public setSnapPinHandler(
        snapPin: (location: BuildingLocation) => BuildingLocation,
    ): void {
        this.snapPinHandler = snapPin;
    }

    private genFromPin(location: BuildingLocation, snap = true): FlooredMarker {
        if (snap) {
            return this.genDraggableSnappingPin(
                location,
                "fa-map-marker-alt",
                (location) => this.events.trigger("dragFromPin", location),
                (location) => this.snapPinHandler(location),
            );
        } else {
            return this.genDraggablePin(
                location,
                "fa-map-marker-alt",
                (location) => this.events.trigger("dragFromPin", location),
            );
        }
    }

    private genToPin(location: BuildingLocation, snap = true): FlooredMarker {
        if (snap) {
            return this.genDraggableSnappingPin(
                location,
                "fa-flag-checkered",
                (location) => this.events.trigger("dragFromPin", location),
                (location) => this.snapPinHandler(location),
            );
        } else {
            return this.genDraggablePin(
                location,
                "fa-flag-checkered",
                (location) => this.events.trigger("dragFromPin", location),
            );
        }
    }

    /**
     * Create a draggable pin that does not snap anywhere when released
     * @param location Location to place the pin; note that the pin will be snapped before it is placed
     * @param iconClass Class used for the icon
     * @param onMove Called when the location of the pin changes, including while it is dragged and when it snaps
     */
    private genDraggablePin(
        location: BuildingLocation,
        iconClass: string,
        onMove: (location: BuildingLocation) => void,
    ): FlooredMarker {
        const icon = <i className="fas" />;
        icon.classList.add(iconClass);

        const pin = flooredMarker(location, {
            draggable: true,
            autoPan: true,
            icon: divIcon({
                className: "draggable-pin",
                html: icon,
            }),
        });

        pin.on("move", (event) => {
            // @ts-expect-error: event does have latlng for move event
            const latLng = event.latlng;
            const pinLocation = new BuildingLocation(
                latLng,
                pin.getFloorNumber(),
            );
            onMove(pinLocation);
        });

        return pin;
    }

    /**
     * Create a draggable pin that snaps to a new location when released
     * @param location Location to place the pin; note that the pin will be snapped before it is placed
     * @param iconClass Class used for the icon
     * @param onMove Called when the location of the pin changes, including while it is dragged and when it snaps
     * @param snapToDefinition Given an initial location, return a location that snaps the pin
     */
    private genDraggableSnappingPin(
        location: BuildingLocation,
        iconClass: string,
        onMove: (location: BuildingLocation) => void,
        snapToDefinition: (snapFrom: BuildingLocation) => BuildingLocation,
    ): FlooredMarker {
        const pin = this.genDraggablePin(location, iconClass, onMove);

        pin.on("dragend", (_event) => {
            const snappedLocation = snapToDefinition(pin.getLocation());
            pin.setLocation(snappedLocation);
            onMove(snappedLocation);
        });

        return pin;
    }
}
