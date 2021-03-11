import { Control, divIcon, Map, PanelOptions } from "leaflet";
import { genTextInput, createPaneElement as genPaneElement } from "../GenHtml/GenHtml";
import { BuildingGeocoder, BuildingGeocoderDefinition, BuildingLocation, BuildingLocationWithEntrances } from "../ts/BuildingLocation";
import { None, Option, Some } from "@nvarner/monads";
import { clearResults, updateWithResults } from "../ts/utils";
import MapData from "../ts/MapData";
import { LFloors, LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";

import { h } from "../ts/JSX";
import { FlooredMarker, flooredMarker } from "./FlooredMarker";

export class NavigationPane {
    private readonly pane: HTMLElement;
    private readonly fromInput: HTMLInputElement;
    private readonly toInput: HTMLInputElement;
    private readonly mapData: MapData;
    private readonly geocoder: BuildingGeocoder;

    private floorsLayer: Option<LFloors>;
    private pathLayers: Set<LSomeLayerWithFloor>;
    private map: Option<Map>;

    public readonly focus: () => any;

    private fromDefinition: Option<BuildingGeocoderDefinition>;
    private toDefinition: Option<BuildingGeocoderDefinition>;

    private fromPin: Option<FlooredMarker>;
    private toPin: Option<FlooredMarker>;

    private constructor(
        pane: HTMLElement,
        fromInput: HTMLInputElement,
        toInput: HTMLInputElement,
        mapData: MapData,
        geocoder: BuildingGeocoder,
        floorsLayer: Option<LFloors>,
        pathLayers: Set<LSomeLayerWithFloor>,
        map: Option<Map>,
        focus: () => any,
        fromDefinition: Option<BuildingGeocoderDefinition>,
        toDefinition: Option<BuildingGeocoderDefinition>,
        fromPin: Option<FlooredMarker>,
        toPin: Option<FlooredMarker>
    ) {
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

    public static new(geocoder: BuildingGeocoder, mapData: MapData, focus: () => any): NavigationPane {
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
                    { fromPinButton }
                    { fromInput }
                </div>
                <div class="wrapper">
                    <label class="leaflet-style no-border nav-label">To</label>
                    { toPinButton }
                    { toInput }
                </div>
            </div>
            { swapToFrom }
        </div>;

        const resultContainer = <div class="wrapper results-wrapper leaflet-style hidden"></div>;

        const navPane = genPaneElement("Navigation", [toFromContainer, resultContainer]);

        const navigationPane = new NavigationPane(navPane, fromInput, toInput, mapData, geocoder, None, new Set(), None, focus, None, None, None, None);

        swapToFrom.addEventListener("click", _event => navigationPane.swapNav(true, true));
        fromInput.addEventListener("input", _event => {
            const query = fromInput.value;
            const results = geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                navigationPane.navigateFrom(Some(definition), true, true);
                clearResults(resultContainer);
            });
        });
        toInput.addEventListener("input", _event => {
            const query = toInput.value;
            const results = geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                navigationPane.navigateTo(Some(definition), true, true);
                clearResults(resultContainer);
            });
        });
        fromPinButton.addEventListener("click", _event => {
            navigationPane.map.ifSome(map => {
                navigationPane.floorsLayer.ifSome(floorsLayer => {
                    navigationPane.fromPin.ifSome(pin => {
                        floorsLayer.removeLayer(pin);
                    });

                    const pinLocation = new BuildingLocation(map.getCenter(), floorsLayer.getCurrentFloor());
                    const pin = NavigationPane.genFromPin(pinLocation, geocoder, navigationPane);
                    pin.addTo(floorsLayer);
                    navigationPane.fromPin = Some(pin);
                });
            });
        });
        toPinButton.addEventListener("click", _event => {
            navigationPane.map.ifSome(map => {
                navigationPane.floorsLayer.ifSome(floorsLayer => {
                    navigationPane.toPin.ifSome(pin => {
                        floorsLayer.removeLayer(pin);
                    });

                    const pinLocation = new BuildingLocation(map.getCenter(), floorsLayer.getCurrentFloor());
                    const pin = NavigationPane.genToPin(pinLocation, geocoder, navigationPane);
                    pin.addTo(floorsLayer);
                    navigationPane.toPin = Some(pin);
                });
            });
        });

        return navigationPane;
    }

    public addTo(map: Map, sidebar: Control.Sidebar): void {
        this.map = Some(map);
        map.eachLayer(layer => {
            if (layer instanceof LFloors) {
                this.floorsLayer = Some(layer);
            }
        });

        sidebar.addPanel(this.getPanelOptions());
    }

    public getPanelOptions(): PanelOptions {
        return {
            id: "nav",
            tab: "<i class=\"fas fa-location-arrow\"></i>",
            title: "Navigation",
            pane: this.pane
        }
    }
    
    private swapNav(movePins: boolean, focus: boolean): void {
        const from = this.fromDefinition;
        this.navigateFrom(this.toDefinition, movePins, focus);
        this.navigateTo(from, movePins, focus);
    }

    public navigateTo(definition: Option<BuildingGeocoderDefinition>, movePin: boolean, focus: boolean): void {
        this.toDefinition = definition;

        this.toInput.value = definition.match({
            some: room => room.name,
            none: ""
        });
        if (movePin) {
            definition.ifSome(definition => {
                const location = definition.location.getCenter();

                this.floorsLayer.ifSome(floorsLayer => {
                    this.toPin.ifSome(pin => {
                        floorsLayer.removeLayer(pin);
                    });

                    const newPin = NavigationPane.genToPin(location, this.geocoder, this)
                        .addTo(floorsLayer);
                    this.toPin = Some(newPin);
                });
            });
        }

        if (focus) {
            this.focus();
        }

        this.calcNavIfNeeded();
    }

    public navigateFrom(definition: Option<BuildingGeocoderDefinition>, movePin: boolean, focus: boolean): void {
        this.fromDefinition = definition;

        this.fromInput.value = definition.match({
            some: room => room.name,
            none: ""
        });
        if (movePin) {
            definition.ifSome(definition => {
                const location = definition.location.getCenter();

                this.floorsLayer.ifSome(floorsLayer => {
                    this.fromPin.ifSome(pin => {
                        floorsLayer.removeLayer(pin);
                    });

                    const newPin = NavigationPane.genFromPin(location, this.geocoder, this)
                        .addTo(floorsLayer);
                    this.fromPin = Some(newPin);
                });
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

    private calcNav(fromDefinition: BuildingGeocoderDefinition, toDefinition: BuildingGeocoderDefinition): void {
        this.clearNav();
        const path = this.mapData.findBestPath(fromDefinition, toDefinition);
        this.pathLayers = this.mapData.createLayerGroupsFromPath(path);
        this.floorsLayer.ifSome(floorsLayer => this.pathLayers.forEach(layer => floorsLayer.addLayer(layer)));
    }

    private clearNav(): void {
        this.floorsLayer.ifSome(floorsLayer => this.pathLayers.forEach(layer => floorsLayer.removeLayer(layer)));
    }

    private static genFromPin(
        location: BuildingLocation,
        geocoder: BuildingGeocoder,
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
        geocoder: BuildingGeocoder,
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
        geocoder: BuildingGeocoder,
        iconClass: string,
        setNavigation: (definition: Option<BuildingGeocoderDefinition>) => void,
        getNavigation: () => Option<BuildingGeocoderDefinition>
    ): FlooredMarker {
        const floor = location.floor;

        const icon = <i class="fas"></i> as HTMLElement;
        icon.classList.add(iconClass);

        const pin = flooredMarker(new BuildingLocation(location.xy, floor), {
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
            const location = new BuildingLocation(latLng, floor);

            NavigationPane.onNewPinLocation(location, geocoder, setNavigation);
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
        geocoder: BuildingGeocoder,
        setNavigation: (definition: Option<BuildingGeocoderDefinition>) => void
    ): void {
        const locationEntrances = new BuildingLocationWithEntrances(location, []);
        const closest = geocoder.getClosestDefinition(locationEntrances);
        setNavigation(Some(closest));
    }

    private static centerPin(
        pin: FlooredMarker,
        getNavigation: () => Option<BuildingGeocoderDefinition>
    ): void {
        getNavigation().ifSome(fromDefinition => {
            pin.setLatLng(fromDefinition.location.getCenter().xy);
        });
    }
}
