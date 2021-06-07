import { divIcon, Map } from "leaflet";
import { genTextInput, genPaneElement } from "../../../../GenHtml/GenHtml";
import { BuildingLocation } from "../../../../BuildingLocation/BuildingLocation";
import { None, Option, Some } from "@nvarner/monads";
import { clearResults, updateWithResults } from "../../../../utils";
import { LFloors, LSomeLayerWithFloor } from "../../../../LFloorsPlugin/LFloorsPlugin";

import { h } from "../../../../JSX";
import { FlooredMarker, flooredMarker } from "./FlooredMarker";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { Pane } from "../Pane";
import { IGeocoderDefinition } from "../../../../Geocoder/IGeocoderDefinition";

export class NavigationPane extends Pane {
    private readonly navigateToHandlers: ((to: Option<IGeocoderDefinition>) => void)[];
    private readonly navigateFromHandlers: ((from: Option<IGeocoderDefinition>) => void)[];
    private readonly swapNavHandlers: (() => void)[];
    private readonly moveFromPinHandlers: ((location: BuildingLocation) => void)[];
    private readonly moveToPinHandlers: ((location: BuildingLocation) => void)[];

    private snapPinHandler: (location: BuildingLocation) => BuildingLocation;

    private pathLayers: Set<LSomeLayerWithFloor>;

    private fromPin: Option<FlooredMarker>;
    private toPin: Option<FlooredMarker>;

    private readonly pane: HTMLElement;

    static inject = ["floors", "map", "geocoder"] as const;
    public constructor(private readonly floors: LFloors, private map: Map, geocoder: Geocoder) {
        super();

        this.navigateFromHandlers = [];
        this.navigateToHandlers = [];
        this.swapNavHandlers = [];
        this.moveFromPinHandlers = [];
        this.moveToPinHandlers = [];

        this.snapPinHandler = (location) => location;

        this.pathLayers = new Set();

        this.fromPin = None;
        this.toPin = None;

        const fromPinButton = <a class="leaflet-style button" href="#" role="button" title="Choose starting point">
            <i class="fas fa-map-marker-alt"/>
        </a> as HTMLAnchorElement;
        const fromInput = genTextInput();

        const toPinButton = <a class="leaflet-style button" href="#" role="button" title="Choose destination">
            <i class="fas fa-flag-checkered"/>
        </a> as HTMLAnchorElement;
        const toInput = genTextInput();

        const swapToFrom = <a class="leaflet-style button swap-button" href="#" role="button" title="Swap to/from">
            <i class="fas fa-exchange-alt"/>
        </a> as HTMLAnchorElement;

        const toFromContainer = <div class="wrapper">
            <div class="wrapper input-wrapper">
                <div class="wrapper">
                    <label class="leaflet-style no-border nav-label">From</label>
                    {fromPinButton}
                    {fromInput}
                </div>
                <div class="wrapper">
                    <label class="leaflet-style no-border nav-label">To</label>
                    {toPinButton}
                    {toInput}
                </div>
            </div>
            {swapToFrom}
        </div>;

        const resultContainer = <div class="wrapper results-wrapper leaflet-style hidden"/>;

        this.pane = genPaneElement("Navigation", [toFromContainer, resultContainer]);

        fromPinButton.addEventListener("click", _event => {
            this.fromPin.ifSome(pin => {
                this.floors.removeLayer(pin);
            });

            const pinLocation = new BuildingLocation(map.getCenter(), floors.getCurrentFloor());
            const pin = this.genFromPin(pinLocation);
            pin.addTo(this.floors);
            this.fromPin = Some(pin);
        });
        toPinButton.addEventListener("click", _event => {
            this.toPin.ifSome(pin => {
                this.floors.removeLayer(pin);
            });

            const pinLocation = new BuildingLocation(map.getCenter(), floors.getCurrentFloor());
            const pin = this.genToPin(pinLocation);
            pin.addTo(this.floors);
            this.toPin = Some(pin);
        });

        swapToFrom.addEventListener("click", _event => this.swapNav());
        fromInput.addEventListener("input", async _event => {
            const query = fromInput.value;
            const results = await geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                this.navigateFrom(Some(definition));
                clearResults(resultContainer);
            });
        });
        toInput.addEventListener("input", async _event => {
            const query = toInput.value;
            const results = await geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                this.navigateTo(Some(definition));
                clearResults(resultContainer);
            });
        });
    }

    // public addTo(map: Map, sidebar: Control.Sidebar): void {
    //     this.map = Some(map);

    //     sidebar.addPanel(this.getPanelOptions());
    // }

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
        this.swapNavHandlers.forEach(handler => handler());
    }

    public navigateTo(definition: Option<IGeocoderDefinition>): void {
        this.navigateToHandlers.forEach(handler => handler(definition));
    }

    public navigateFrom(definition: Option<IGeocoderDefinition>): void {
        this.navigateFromHandlers.forEach(handler => handler(definition));
    }

    public clearNav(): void {
        this.pathLayers.forEach(layer => this.floors.removeLayer(layer));
    }

    public displayNav(layers: Set<LSomeLayerWithFloor>): void {
        this.pathLayers = layers;
        this.pathLayers.forEach(layer => this.floors.addLayer(layer));
    }

    /**
     * Register a callback for when the source and destination of the navigation are swapped
     * @param onSwap The callback
     */
    public registerOnSwapNav(onSwap: () => void): void {
        this.swapNavHandlers.push(onSwap);
    }

    /**
     * Register a callback for when the user navigates to a definition
     * @param onNavigateTo The callback, which takes in the definition the user navigated to
     */
    public registerOnNavigateTo(onNavigateTo: (definition: Option<IGeocoderDefinition>) => void): void {
        this.navigateToHandlers.push(onNavigateTo);
    }

    /**
     * Register a callback for when the user navigates from a definition
     * @param onNavigateFrom The callback, which takes in the definition the user navigated from
     */
    public registerOnNavigateFrom(onNavigateFrom: (definition: Option<IGeocoderDefinition>) => void): void {
        this.navigateFromHandlers.push(onNavigateFrom);
    }

    /**
     * Register a callback for when the navigation pin representing the starting location is moved
     * @param onMove The callback, which takes in the current position of the pin
     */
    public registerOnMoveFromPin(onMove: (currentLocation: BuildingLocation) => void): void {
        this.moveFromPinHandlers.push(onMove);
    }

    /**
     * Register a callback for when the navigation pin representing the destination is moved
     * @param onMove The callback, which takes in the current position of the pin
     */
    public registerOnMoveToPin(onMove: (currentLocation: BuildingLocation) => void): void {
        this.moveToPinHandlers.push(onMove);
    }

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    public setSnapPinHandler(snapPin: (location: BuildingLocation) => BuildingLocation): void {
        this.snapPinHandler = snapPin;
    }

    private onMoveFromPin(currentLocation: BuildingLocation): void {
        this.moveFromPinHandlers.forEach(handler => handler(currentLocation));
    }

    private onMoveToPin(currentLocation: BuildingLocation): void {
        this.moveToPinHandlers.forEach(handler => handler(currentLocation));
    }

    private genFromPin(location: BuildingLocation): FlooredMarker {
        return this.genDraggableSnappingPin(
            location,
            "fa-map-marker-alt",
            location => this.onMoveFromPin(location),
            location => this.snapPinHandler(location)
        );
    }

    private genToPin(location: BuildingLocation): FlooredMarker {
        return this.genDraggableSnappingPin(
            location,
            "fa-flag-checkered",
            location => this.onMoveToPin(location),
            location => this.snapPinHandler(location)
        );
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
        snapToDefinition: (snapFrom: BuildingLocation) => BuildingLocation
    ): FlooredMarker {
        const icon = <i class="fas"></i> as HTMLElement;
        icon.classList.add(iconClass);

        const snapLocation = snapToDefinition(location);
        const pin = flooredMarker(snapLocation, {
            draggable: true,
            autoPan: true,
            icon: divIcon({
                className: "draggable-pin",
                html: icon
            })
        });
        onMove(snapLocation);

        pin.on("move", event => {
            // eslint-disable-next-line
            // @ts-ignore: event does have latlng for move event
            const latLng = event.latlng;
            const pinLocation = new BuildingLocation(latLng, pin.getFloorNumber());
            onMove(pinLocation);
        }).on("dragend", event => {
            // eslint-disable-next-line
            // @ts-ignore: event does have latlng for move event
            const latLng = event.latlng;
            const pinLocation = new BuildingLocation(latLng, pin.getFloorNumber());
            const snappedLocation = snapToDefinition(pinLocation);
            pin.setLocation(snappedLocation);
            onMove(snappedLocation);
        });

        return pin;
    }

    // private static onNewPinLocation(
    //     location: BuildingLocation,
    //     geocoder: Geocoder,
    //     setNavigation: (definition: Option<IGeocoderDefinition>) => void
    // ): void {
    //     const locationEntrances = new BuildingLocationWithEntrances(location, []);
    //     const closest = geocoder.getClosestDefinition(locationEntrances);
    //     setNavigation(closest);
    // }

    // private centerPinOnDefinition(pin: FlooredMarker, getNavigation: () => Option<IGeocoderDefinition>): void {
    //     getNavigation().ifSome(fromDefinition => {
    //         pin.setLatLng(fromDefinition.getLocation().getXY());
    //     });
    // }
}
