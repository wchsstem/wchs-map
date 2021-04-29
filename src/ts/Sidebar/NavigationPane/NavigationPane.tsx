import { Control, divIcon, Map } from "leaflet";
import { genTextInput, genPaneElement } from "../../GenHtml/GenHtml";
import { BuildingLocation, BuildingLocationWithEntrances } from "../../BuildingLocation";
import { None, Option, Some } from "@nvarner/monads";
import { clearResults, updateWithResults } from "../../utils";
import MapData from "../../MapData";
import { LFloors, LSomeLayerWithFloor } from "../../LFloorsPlugin/LFloorsPlugin";

import { h } from "../../JSX";
import { FlooredMarker, flooredMarker } from "./FlooredMarker";
import { Geocoder, GeocoderDefinition } from "../../Geocoder";
import { Pane } from "../Pane";

export class NavigationPane extends Pane {
    private readonly pane: HTMLElement;
    private readonly fromInput: HTMLInputElement;
    private readonly toInput: HTMLInputElement;
    private readonly mapData: MapData;
    private readonly geocoder: Geocoder;

    private readonly floorsLayer: LFloors;
    private pathLayers: Set<LSomeLayerWithFloor>;
    private map: Option<Map>;

    public readonly focus: () => any;

    private fromDefinition: Option<GeocoderDefinition>;
    private toDefinition: Option<GeocoderDefinition>;

    private fromPin: Option<FlooredMarker>;
    private toPin: Option<FlooredMarker>;

    private constructor(
        pane: HTMLElement,
        fromInput: HTMLInputElement,
        toInput: HTMLInputElement,
        mapData: MapData,
        geocoder: Geocoder,
        floorsLayer: LFloors,
        pathLayers: Set<LSomeLayerWithFloor>,
        map: Option<Map>,
        focus: () => any,
        fromDefinition: Option<GeocoderDefinition>,
        toDefinition: Option<GeocoderDefinition>,
        fromPin: Option<FlooredMarker>,
        toPin: Option<FlooredMarker>
    ) {
        super();
        this.pane = pane;
        this.fromInput = fromInput;
        this.toInput = toInput;
        this.mapData = mapData;
        this.geocoder = geocoder;
        this.floorsLayer = floorsLayer;
        this.pathLayers = pathLayers;
        this.map = map;
        this.focus = focus;
        this.fromDefinition = fromDefinition;
        this.toDefinition = toDefinition;
        this.fromPin = fromPin;
        this.toPin = toPin;
    }

    public static new(geocoder: Geocoder, mapData: MapData, floorsLayer: LFloors, focus: () => any): NavigationPane {
        const fromPinButton = <a class="leaflet-style button" href="#" role="button" title="Choose starting point">
            <i class="fas fa-map-marker-alt"></i>
        </a> as HTMLAnchorElement;
        const fromInput = genTextInput();

        const toPinButton = <a class="leaflet-style button" href="#" role="button" title="Choose destination">
            <i class="fas fa-flag-checkered"></i>
        </a> as HTMLAnchorElement;
        const toInput = genTextInput();

        const swapToFrom = <a class="leaflet-style button swap-button" href="#" role="button" title="Swap to/from">
            <i class="fas fa-exchange-alt"></i>
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

        const resultContainer = <div class="wrapper results-wrapper leaflet-style hidden"></div>;

        const navPane = genPaneElement("Navigation", [toFromContainer, resultContainer]);

        const navigationPane = new NavigationPane(navPane, fromInput, toInput, mapData, geocoder, floorsLayer, new Set(), None, focus, None, None, None, None);

        swapToFrom.addEventListener("click", _event => navigationPane.swapNav(true, true));
        fromInput.addEventListener("input", async _event => {
            const query = fromInput.value;
            const results = await geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                navigationPane.navigateFrom(Some(definition), true, true);
                clearResults(resultContainer);
            });
        });
        toInput.addEventListener("input", async _event => {
            const query = toInput.value;
            const results = await geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                navigationPane.navigateTo(Some(definition), true, true);
                clearResults(resultContainer);
            });
        });
        fromPinButton.addEventListener("click", _event => {
            navigationPane.map.ifSome(map => {
                navigationPane.fromPin.ifSome(pin => {
                    navigationPane.floorsLayer.removeLayer(pin);
                });

                const pinLocation = new BuildingLocation(map.getCenter(), floorsLayer.getCurrentFloor());
                const pin = NavigationPane.genFromPin(pinLocation, geocoder, navigationPane);
                pin.addTo(navigationPane.floorsLayer);
                navigationPane.fromPin = Some(pin);
            });
        });
        toPinButton.addEventListener("click", _event => {
            navigationPane.map.ifSome(map => {
                navigationPane.toPin.ifSome(pin => {
                    navigationPane.floorsLayer.removeLayer(pin);
                });

                const pinLocation = new BuildingLocation(map.getCenter(), navigationPane.floorsLayer.getCurrentFloor());
                const pin = NavigationPane.genToPin(pinLocation, geocoder, navigationPane);
                pin.addTo(navigationPane.floorsLayer);
                navigationPane.toPin = Some(pin);
            });
        });

        return navigationPane;
    }

    public addTo(map: Map, sidebar: Control.Sidebar): void {
        this.map = Some(map);

        sidebar.addPanel(this.getPanelOptions());
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

    private swapNav(movePins: boolean, focus: boolean): void {
        const from = this.fromDefinition;
        this.navigateFrom(this.toDefinition, movePins, focus);
        this.navigateTo(from, movePins, focus);
    }

    public navigateTo(definition: Option<GeocoderDefinition>, movePin: boolean, focus: boolean): void {
        this.toDefinition = definition;

        this.toInput.value = definition.match({
            some: room => room.getName(),
            none: ""
        });
        if (movePin) {
            definition.ifSome(definition => {
                const location = definition.getLocation();

                this.toPin.ifSome(pin => {
                    this.floorsLayer.removeLayer(pin);
                });

                const newPin = NavigationPane.genToPin(location, this.geocoder, this)
                    .addTo(this.floorsLayer);
                this.toPin = Some(newPin);
            });
        }

        if (focus) {
            this.focus();
        }

        this.calcNavIfNeeded();
    }

    public navigateFrom(definition: Option<GeocoderDefinition>, movePin: boolean, focus: boolean): void {
        this.fromDefinition = definition;

        this.fromInput.value = definition.match({
            some: room => room.getName(),
            none: ""
        });
        if (movePin) {
            definition.ifSome(definition => {
                const location = definition.getLocation();

                this.fromPin.ifSome(pin => {
                    this.floorsLayer.removeLayer(pin);
                });

                const newPin = NavigationPane.genFromPin(location, this.geocoder, this)
                    .addTo(this.floorsLayer);
                this.fromPin = Some(newPin);
            });
        }

        if (focus) {
            this.focus();
        }

        this.calcNavIfNeeded();
    }

    private calcNavIfNeeded(): void {
        if (this.fromDefinition.isSome() && this.toDefinition.isSome()) {
            this.calcNav(this.fromDefinition.unwrap(), this.toDefinition.unwrap());
        }
    }

    private calcNav(fromDefinition: GeocoderDefinition, toDefinition: GeocoderDefinition): void {
        this.clearNav();
        const path = this.mapData.findBestPath(fromDefinition, toDefinition);
        path.ifSome(path => {
            this.pathLayers = this.mapData.createLayerGroupsFromPath(path);
            this.pathLayers.forEach(layer => this.floorsLayer.addLayer(layer));
        });
    }

    private clearNav(): void {
        this.pathLayers.forEach(layer => this.floorsLayer.removeLayer(layer));
    }

    private static genFromPin(
        location: BuildingLocation,
        geocoder: Geocoder,
        navigationPane: NavigationPane
    ): FlooredMarker {
        return NavigationPane.genDraggablePin(
            location,
            geocoder,
            "fa-map-marker-alt",
            definition => navigationPane.navigateFrom(definition, false, false),
            () => navigationPane.fromDefinition
        );
    }

    private static genToPin(
        location: BuildingLocation,
        geocoder: Geocoder,
        navigationPane: NavigationPane
    ): FlooredMarker {
        return NavigationPane.genDraggablePin(
            location,
            geocoder,
            "fa-flag-checkered",
            definition => navigationPane.navigateTo(definition, false, false),
            () => navigationPane.toDefinition
        );
    }

    private static genDraggablePin(
        location: BuildingLocation,
        geocoder: Geocoder,
        iconClass: string,
        setNavigation: (definition: Option<GeocoderDefinition>) => void,
        getNavigation: () => Option<GeocoderDefinition>
    ): FlooredMarker {
        const icon = <i class="fas"></i> as HTMLElement;
        icon.classList.add(iconClass);

        const pin = flooredMarker(location, {
            draggable: true,
            autoPan: true,
            icon: divIcon({
                className: "draggable-pin",
                html: icon
            })
        });

        pin.on("move", event => {
            // @ts-ignore: Included in move event
            const latLng = event.latlng;
            const pinLocation = new BuildingLocation(latLng, location.getFloor());

            NavigationPane.onNewPinLocation(pinLocation, geocoder, setNavigation);
        })
            .on("dragend", _event => {
                NavigationPane.centerPin(pin, getNavigation);
            });

        NavigationPane.onNewPinLocation(location, geocoder, setNavigation);
        NavigationPane.centerPin(pin, getNavigation);

        return pin;
    }

    private static onNewPinLocation(
        location: BuildingLocation,
        geocoder: Geocoder,
        setNavigation: (definition: Option<GeocoderDefinition>) => void
    ): void {
        const locationEntrances = new BuildingLocationWithEntrances(location, []);
        const closest = geocoder.getClosestDefinition(locationEntrances);
        setNavigation(closest);
    }

    private static centerPin(pin: FlooredMarker, getNavigation: () => Option<GeocoderDefinition>): void {
        getNavigation().ifSome(fromDefinition => {
            pin.setLatLng(fromDefinition.getLocation().getXY());
        });
    }
}
