import * as L from "leaflet";
import { RoomSearch } from "./RoomSearch";
import { genTextInput } from "../GenHtml/GenHtml";
import MapData from "../ts/MapData";

import "./sidebar.scss";
import Room from "../ts/Room";
import { LFloors, LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { settings, Watcher } from "../ts/settings";
import { Course, Synergy } from "../Synergy/Synergy";
import { GeocoderDefinition, GeocoderSuggestion } from "../ts/Geocoder";
import { BuildingLocation, BuildingLocationWithEntrances } from "../ts/BuildingLocation";
import { geocoder } from "../ts/utils";
import { None, Option, Some } from "@hqoss/monads";

let sidebar: Sidebar | null = null;

export function createSidebar(map: L.Map, mapData: MapData) {
    sidebar = new Sidebar(map, mapData);
}

export function showRoomInfo(room: Room) {
    if (sidebar !== null) {
        sidebar.openInfoForName(room.getName());
    }
}

const MAX_FILE_SIZE = 2*1024*1024;

class Sidebar {
    private map: L.Map;
    private sidebar: L.Control.Sidebar;
    private floorsLayer: Option<LFloors>;
    private pathLayers: Set<LSomeLayerWithFloor>;

    private mapData: MapData;

    private fromDefinition: Option<GeocoderDefinition<BuildingLocationWithEntrances>>;
    private toDefinition: Option<GeocoderDefinition<BuildingLocationWithEntrances>>;
    private fromInput: HTMLInputElement;
    private toInput: HTMLInputElement;

    constructor(map: L.Map, mapData: MapData) {
        this.map = map;
        this.sidebar = L.control.sidebar({
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.floorsLayer = None;
        this.map.eachLayer((layer) => {
            // @ts-ignore: Truthy if layer is LFloors, otherwise falsy
            // TODO: Can instanceof be used here?
            if (layer.getDefaultFloor) {
                this.floorsLayer = Some(<LFloors> layer);
            }
        });

        this.mapData = mapData;

        settings.addWatcher("Enable Synergy Panel (alpha)", new Watcher((enable) => {
            if (enable) {
                this.sidebar.addPanel(this.createSynergyPanel());
            } else {
                this.sidebar.removePanel("synergy");
            }
        }));

        const roomSearch = new RoomSearch(mapData);
        this.sidebar.addPanel(this.createSearchPanel(roomSearch));

        this.fromDefinition = None;
        this.toDefinition = None;

        const [navPanel, fromInput, toInput] = this.createNavPanel(roomSearch);
        this.fromInput = fromInput;
        this.toInput = toInput;
        this.sidebar.addPanel(navPanel);

        this.sidebar.addPanel(this.createSettingsPanel());
    }

    // Synergy panel
    private createSynergyPanel(): L.Control.PanelOptions {
        const beta = Sidebar.elWithText("p", "Currently in alpha. Doesn't work yet.");
        const info = Sidebar.elWithText("p", "Download your Synergy page and upload the HTML file here.");

        const siteUpload = document.createElement("input");
        siteUpload.setAttribute("type", "file");
        siteUpload.setAttribute("accept", "text/html");

        const errorBox = document.createElement("p");
        const courses = document.createElement("ol");

        siteUpload.addEventListener("change", () => {
            if (siteUpload.files.length === 0) {
                return;
            }

            errorBox.innerText = "";

            const file = siteUpload.files[0];
            if (file.type !== "text/html") {
                errorBox.innerText = "Wrong file type uploaded.";
                return;
            }

            
            if(file.size > MAX_FILE_SIZE) {
                errorBox.innerText = "File size is greater than 2 MB.";
                return;
            }

            const reader = new FileReader();

            reader.addEventListener("error", () => {
                errorBox.innerText = "There was an error reading the file.";
            });

            reader.addEventListener("load", (result) => {
                const synergyPage = result.target.result.toString();
                const synergy = new Synergy(synergyPage);
                for (const course of synergy.getCourses()) {
                    courses.appendChild(course.toHtmlLi());
                    console.log(course.toString());
                }
            });

            reader.readAsText(file);
        });
            
        const synergyPane = Sidebar.createPaneElement("Synergy", [siteUpload, errorBox, courses]);

        return {
            id: "synergy",
            tab: "<i class=\"fas fa-sign-in-alt\"></i>",
            title: "Synergy",
            pane: synergyPane
        };
    }

    // Search panel
    private createSearchPanel(roomSearch: RoomSearch): L.Control.PanelOptions {
        const searchBarContainer = document.createElement("div");
        searchBarContainer.classList.add("wrapper");

        const searchBar = genTextInput();
        searchBarContainer.appendChild(searchBar);

        const resultContainer = document.createElement("div");
        resultContainer.classList.add("wrapper");
        resultContainer.classList.add("results-wrapper");
        resultContainer.classList.add("leaflet-style");
        resultContainer.classList.add("hidden");

        const thiz = this;
        searchBar.addEventListener("input", () => {
            const query = searchBar.value;
            const results = geocoder.getSuggestionsFrom(query);
            this.updateWithResults(query, results, resultContainer, (result) => {
                thiz.openInfoForName(result.name);
            });
        });

        const searchPane = Sidebar.createPaneElement("Search", [searchBarContainer, resultContainer]);

        return {
            id: "search",
            tab: "<i class=\"fas fa-search-location\"></i>",
            title: "Search",
            pane: searchPane
        };
    }

    // TODO: Where should this go? Used by multiple panels
    private updateWithResults(
        query: string,
        results: GeocoderSuggestion[],
        resultContainer: HTMLElement,
        onClickResult: (result: GeocoderSuggestion) => void
    ) {
        if (query === "") {
            resultContainer.classList.add("hidden");
            return;
        }

        resultContainer.classList.remove("hidden");

        while (resultContainer.hasChildNodes()) {
            resultContainer.removeChild(resultContainer.firstChild);
        }

        if (results.length > 0) {
            const list = document.createElement("ul");
            for (const result of results) {
                const resultElement = document.createElement("li");
                resultElement.classList.add("search-result");
                resultElement.appendChild(document.createTextNode(result.name));
                resultElement.addEventListener("click", () => {
                    onClickResult(result);
                });
                list.appendChild(resultElement);
            }

            resultContainer.appendChild(list);
        } else {
            const noResults = document.createTextNode("No results");
            resultContainer.appendChild(noResults);
        }
    }

    // Info panel
    private createInfoPanel(definition: GeocoderDefinition<BuildingLocationWithEntrances>): L.Control.PanelOptions {
        const paneElements = [];

        this.createInfoPanelHeader(paneElements, definition);

        const roomFloor = Sidebar.elWithText("span", `Floor: ${definition.location.getCenter().floor}`);
        paneElements.push(roomFloor);

        if (definition.description.length !== 0) {
            const descriptionEl = document.createElement("p");
            const descriptionText = document.createTextNode(definition.description);
            descriptionEl.appendChild(descriptionText);
            paneElements.push(descriptionEl);
        }

        const infoPane = Sidebar.createPaneElement("Room Info", paneElements);

        return {
            id: "info",
            tab: "<i class=\"fas fa-info\"></i>",
            title: "Room Info",
            pane: infoPane
        };
    }

    private createInfoPanelHeader(
        paneElements: HTMLElement[],
        definition: GeocoderDefinition<BuildingLocationWithEntrances>
    ) {
        const header = document.createElement("div");
        header.classList.add("wrapper");
        header.classList.add("header-wrapper");
        paneElements.push(header);

        const roomName = document.createElement("h2");
        const roomNameText = document.createTextNode(definition.name);
        roomName.appendChild(roomNameText);
        header.appendChild(roomName);

        const thiz = this;

        const viewRoomButton = Sidebar.button("fa-map-pin", () => {
            thiz.moveToDefinedLocation(definition);
        }, "Show room");
        viewRoomButton.classList.add("push-right");
        header.appendChild(viewRoomButton);

        const navButton = Sidebar.button("fa-location-arrow", () => {
            thiz.navigateTo(Some(definition));
        }, "Navigate");
        header.appendChild(navButton);
    }

    public openInfoForName(name: string) {
        geocoder.getDefinitionFromName(name).match({
            some: location => {
                this.sidebar.removePanel("info");
                this.sidebar.addPanel(this.createInfoPanel(location));
                this.sidebar.open("info");
                this.moveToDefinedLocation(location);
            },
            none: () => {}
        });
    }

    // Nav panel
    private createNavPanel(roomSearch: RoomSearch): [L.Control.PanelOptions, HTMLInputElement, HTMLInputElement] {
        const toFromContainer = document.createElement("div");
        toFromContainer.classList.add("wrapper");

        const inputContainer = document.createElement("div");
        inputContainer.classList.add("wrapper");
        inputContainer.classList.add("input-wrapper");
        toFromContainer.appendChild(inputContainer);

        const fromInputContainer = document.createElement("div");
        fromInputContainer.classList.add("wrapper");
        const fromInputLabel = Sidebar.elWithText("label", "From");
        fromInputLabel.classList.add("leaflet-style");
        fromInputLabel.classList.add("no-border");
        fromInputLabel.classList.add("nav-label");
        fromInputContainer.appendChild(fromInputLabel);
        const fromInput = genTextInput();
        fromInputContainer.appendChild(fromInput);
        inputContainer.appendChild(fromInputContainer);

        const toInputContainer = document.createElement("div");
        toInputContainer.classList.add("wrapper");
        const toInputLabel = Sidebar.elWithText("label", "To");
        toInputLabel.classList.add("leaflet-style");
        toInputLabel.classList.add("no-border");
        toInputLabel.classList.add("nav-label");
        toInputContainer.appendChild(toInputLabel);
        const toInput = genTextInput();
        toInputContainer.appendChild(toInput);
        inputContainer.appendChild(toInputContainer);

        const thiz = this;
        const swapToFrom = Sidebar.button("fa-exchange-alt", () => {
            thiz.swapNav();
        }, "Swap to/from");
        swapToFrom.classList.add("swap-button");
        toFromContainer.appendChild(swapToFrom);

        const resultContainer = document.createElement("div");
        resultContainer.classList.add("wrapper");
        resultContainer.classList.add("results-wrapper");
        resultContainer.classList.add("leaflet-style");
        resultContainer.classList.add("hidden");

        fromInput.addEventListener("input", () => {
            const query = fromInput.value;
            const results = geocoder.getSuggestionsFrom(query);
            this.updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                thiz.navigateFrom(Some(definition));
                Sidebar.clearResults(resultContainer);
            });
        });

        toInput.addEventListener("input", () => {
            const query = toInput.value;
            const results = geocoder.getSuggestionsFrom(query);
            this.updateWithResults(query, results, resultContainer, (result) => {
                const definition = geocoder.getDefinitionFromName(result.name).unwrap();
                thiz.navigateTo(Some(definition));
                Sidebar.clearResults(resultContainer);
            });
        });

        const navPane = Sidebar.createPaneElement("Navigation", [toFromContainer, resultContainer]);

        const panelOptions = {
            id: "nav",
            tab: "<i class=\"fas fa-location-arrow\"></i>",
            title: "Navigation",
            pane: navPane
        }

        return [panelOptions, fromInput, toInput];
    }

    // TODO: Should this really be Option?
    public navigateTo(definition: Option<GeocoderDefinition<BuildingLocationWithEntrances>>) {
        this.toDefinition = definition;
        this.toInput.value = definition.match({
            some: room => room.name,
            none: ""
        });
        this.sidebar.open("nav");
        this.calcNavIfNeeded();
    }

    public navigateFrom(definition: Option<GeocoderDefinition<BuildingLocationWithEntrances>>) {
        this.fromDefinition = definition;
        this.fromInput.value = definition.match({
            some: room => room.name,
            none: ""
        });
        this.sidebar.open("nav");
        this.calcNavIfNeeded();
    }

    public swapNav() {
        const from = this.fromDefinition;
        this.navigateFrom(this.toDefinition);
        this.navigateTo(from);
    }

    private calcNavIfNeeded() {
        console.log("Calc if needed");
        if (this.fromDefinition.isSome() && this.toDefinition.isSome()) {
            this.calcNav(this.fromDefinition.unwrap(), this.toDefinition.unwrap());
        }
    }

    private calcNav(
        fromDefinition: GeocoderDefinition<BuildingLocationWithEntrances>,
        toDefinition: GeocoderDefinition<BuildingLocationWithEntrances>
    ) {
        this.clearNav();
        const path = this.mapData.findBestPath(fromDefinition, toDefinition);
        console.log("path", path);
        this.pathLayers = this.mapData.createLayerGroupsFromPath(path);
        this.floorsLayer.match({
            some: floorsLayer => {
                for (const layer of this.pathLayers) {
                    floorsLayer.addLayer(layer);
                }
            },
            none: () => {}
        });
    }

    private clearNav() {
        // TODO: Is this check needed?
        if (this.pathLayers !== undefined) {
            this.floorsLayer.match({
                some: floorsLayer => {
                    for (const layer of this.pathLayers) {
                        floorsLayer.removeLayer(layer);
                    }
                },
                none: () => {}
            });
        }
    }

    // Settings panel
    private createSettingsPanel(): L.Control.PanelOptions {
        const settingsContainer = document.createElement("ul");
        settingsContainer.classList.add("wrapper");
        settingsContainer.classList.add("settings-container");

        for (const [name, value] of settings.getAllSettings()) {
            let setting = null;

            if (typeof value === "string") {
                setting = Sidebar.createStringSetting(name, value);
            } else if (typeof value === "boolean") {
                setting = Sidebar.createBooleanSetting(name, value);
            }

            if (setting !== null) {
                settingsContainer.appendChild(setting);
            }
        }

        const settingsPane = Sidebar.createPaneElement("Settings", settingsContainer);

        return {
            id: "settings",
            tab: "<i class=\"fas fa-cog\"></i>",
            title: "Settings",
            pane: settingsPane,
            position: "bottom"
        };
    }

    private static createSetting(name: string, control: HTMLElement): HTMLLIElement {
        const container = document.createElement("li");
        container.classList.add("setting-container");

        container.appendChild(Sidebar.elWithText("label", name));
        container.appendChild(control);

        return container;
    }

    private static createStringSetting(name: string, value: string): HTMLLIElement {
        const control = genTextInput("", value);
        control.addEventListener("change", () => {
            settings.updateData(name, control.value);
        });
        return Sidebar.createSetting(name, control);
    }

    private static createBooleanSetting(name: string, value: boolean): HTMLLIElement {
        const control = document.createElement("input");
        control.setAttribute("type", "checkbox");
        control.checked = value;
        control.addEventListener("change", () => {
            settings.updateData(name, control.checked);
        });
        return Sidebar.createSetting(name, control);
    }

    // Utils
    private moveToDefinedLocation(definition: GeocoderDefinition<BuildingLocationWithEntrances>, openPopup: boolean = false) {
        const location = definition.location.getCenter();
        this.map.setView(location.xy, 3);
        this.floorsLayer.match({
            some: floorsLayer => floorsLayer.setFloor(location.floor),
            none: () => {} 
        })
        // TODO: Find way to get room or access number marker
        // if (openPopup) {
        //     room.getNumberMarker().openPopup();
        // }
    }

    private static createPaneElement(title: string, content: HTMLElement | HTMLElement[]): HTMLElement {
        const pane = document.createElement("div");
        pane.classList.add("leaflet-sidebar-pane");
    
        const header = document.createElement("h1");
        header.classList.add("leaflet-sidebar-header");
        pane.appendChild(header);
    
        const titleNode = document.createTextNode(title);
        header.appendChild(titleNode);
    
        const closeSpan = document.createElement("span");
        closeSpan.classList.add("leaflet-sidebar-close");
        header.appendChild(closeSpan);
    
        const closeIcon = document.createElement("i");
        closeIcon.classList.add("fas");
        closeIcon.classList.add("fa-caret-left");
        closeSpan.appendChild(closeIcon);
    
        // @ts-ignore: Checking for array type
        if (content.length) {
            for (const el of content) {
                pane.appendChild(el);
            }
        } else {
            // @ts-ignore: Single HTML element
            pane.appendChild(content);
        }
        
        return pane;
    }

    private static elWithText(elementName: string, content?: string): HTMLElement {
        const element = document.createElement(elementName);
        if (content) {
            const text = document.createTextNode(content);
            element.appendChild(text);
        }
        return element;
    }

    private static button(iconClass: string, onClickHandler?: (this: HTMLAnchorElement, ev: MouseEvent) => any, title?: string): HTMLAnchorElement {
        const button = document.createElement("a");
        button.classList.add("button");
        button.setAttribute("href", "#");

        if (title) {
            button.setAttribute("title", title);
        }

        if (onClickHandler) {
            button.addEventListener("click", onClickHandler);
        }

        const icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add(iconClass);
        button.appendChild(icon);

        return button;
    }

    private static clearResults(resultContainer: HTMLElement) {
        while (resultContainer.hasChildNodes()) {
            resultContainer.removeChild(resultContainer.lastChild);
        }
        resultContainer.classList.add("hidden");
    }
}
