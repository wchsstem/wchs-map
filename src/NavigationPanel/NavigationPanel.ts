import { Control, divIcon, Map, marker, PanelOptions } from "leaflet";
import { genButtonLabel, genButtonIcon, genElText, genTextInput, createPaneElement as genPaneElement } from "../GenHtml/GenHtml";
import { BuildingGeocoder, BuildingGeocoderDefinition } from "../ts/BuildingLocation";
import { None, Option, Some } from "@nvarner/monads";
import { clearResults, updateWithResults } from "../ts/utils";
import MapData from "../ts/MapData";
import { LFloors, LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";

export class NavigationPanel {
    private readonly pane: HTMLElement;
    private readonly fromInput: HTMLInputElement;
    private readonly toInput: HTMLInputElement;
    private readonly mapData: MapData;

    private floorsLayer: Option<LFloors>;
    private pathLayers: Set<LSomeLayerWithFloor>;

    public readonly focus: () => any;

    private fromDefinition: Option<BuildingGeocoderDefinition>;
    private toDefinition: Option<BuildingGeocoderDefinition>;

    private constructor(
        pane: HTMLElement,
        fromInput: HTMLInputElement,
        toInput: HTMLInputElement,
        mapData: MapData,
        floorsLayer: Option<LFloors>,
        pathLayers: Set<LSomeLayerWithFloor>,
        focus: () => any,
        fromDefinition: Option<BuildingGeocoderDefinition>,
        toDefinition: Option<BuildingGeocoderDefinition>
    ) {
        this.pane = pane;
        this.fromInput = fromInput;
        this.toInput = toInput;
        this.mapData = mapData;
        this.floorsLayer = floorsLayer;
        this.pathLayers = pathLayers;
        this.focus = focus;
        this.fromDefinition = fromDefinition;
        this.toDefinition = toDefinition;
    }

    public static new(geocoder: BuildingGeocoder, mapData: MapData, focus: () => any): NavigationPanel {
        const toFromContainer = document.createElement("div");
        toFromContainer.classList.add("wrapper");

        const inputContainer = document.createElement("div");
        inputContainer.classList.add("wrapper");
        inputContainer.classList.add("input-wrapper");
        toFromContainer.appendChild(inputContainer);

        const fromInputContainer = document.createElement("div");
        fromInputContainer.classList.add("wrapper");
        const fromInputLabel = genElText("label", "From");
        fromInputLabel.classList.add("leaflet-style");
        fromInputLabel.classList.add("no-border");
        fromInputLabel.classList.add("nav-label");
        fromInputContainer.appendChild(fromInputLabel);
        const fromInput = genTextInput();
        fromInputContainer.appendChild(fromInput);
        inputContainer.appendChild(fromInputContainer);

        const toInputContainer = document.createElement("div");
        toInputContainer.classList.add("wrapper");
        const toInputLabel = genElText("label", "To");
        toInputLabel.classList.add("leaflet-style");
        toInputLabel.classList.add("no-border");
        toInputLabel.classList.add("nav-label");
        toInputContainer.appendChild(toInputLabel);
        const pinButton = genButtonLabel("pin", () => {
            console.log("test");
        });
        toInputContainer.appendChild(pinButton);
        const toInput = genTextInput();
        toInputContainer.appendChild(toInput);
        inputContainer.appendChild(toInputContainer);

        const swapToFrom = genButtonIcon("fa-exchange-alt", () => {}, "Swap to/from");
        swapToFrom.classList.add("swap-button");
        toFromContainer.appendChild(swapToFrom);

        const resultContainer = document.createElement("div");
        resultContainer.classList.add("wrapper");
        resultContainer.classList.add("results-wrapper");
        resultContainer.classList.add("leaflet-style");
        resultContainer.classList.add("hidden");

        const navPane = genPaneElement("Navigation", [toFromContainer, resultContainer]);

        // marker([0, 0], {
        //     draggable: true,
        //     autoPan: true,
        //     icon: divIcon()
        // }).on("move", (e) => {
        //     // @ts-ignore: Included in move event
        //     const latLng = e.latlng;
        //     console.log(latLng);
        // }).addTo(map);

        const navigationPanel = new NavigationPanel(navPane, fromInput, toInput, mapData, None, new Set(), focus, None, None);

        swapToFrom.addEventListener("click", _event => navigationPanel.swapNav());
        fromInput.addEventListener("input", _event => {
            const query = fromInput.value;
            const results = geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                navigationPanel.navigateFrom(Some(definition));
                clearResults(resultContainer);
            });
        });
        toInput.addEventListener("input", _event => {
            const query = toInput.value;
            const results = geocoder.getSuggestionsFrom(query);
            updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                navigationPanel.navigateTo(Some(definition));
                clearResults(resultContainer);
            });
        });

        return navigationPanel;
    }

    public addTo(map: Map, sidebar: Control.Sidebar): void {
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
    
    private swapNav(): void {
        const from = this.fromDefinition;
        this.navigateFrom(this.toDefinition);
        this.navigateTo(from);
    }

    public navigateTo(definition: Option<BuildingGeocoderDefinition>): void {
        this.toDefinition = definition;
        this.toInput.value = definition.match({
            some: room => room.name,
            none: ""
        });
        this.focus();
        this.calcNavIfNeeded();
    }

    public navigateFrom(definition: Option<BuildingGeocoderDefinition>): void {
        this.fromDefinition = definition;
        this.fromInput.value = definition.match({
            some: room => room.name,
            none: ""
        });
        this.focus();
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
}
