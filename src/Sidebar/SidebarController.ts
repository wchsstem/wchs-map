import * as L from "leaflet";
import { RoomSearch } from "./RoomSearch";
import { genTextInput } from "../GenHtml/GenHtml";
import MapData from "../ts/MapData";

import "./sidebar.scss";
import Room from "../ts/Room";
import { LFloors, LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { settings, Watcher } from "../ts/settings";

let sidebar: Sidebar | null = null;

export function createSidebar(map: L.Map, mapData: MapData) {
    sidebar = new Sidebar(map, mapData);
}

export function showRoomInfo(room: Room) {
    if (sidebar !== null) {
        sidebar.openInfoForRoom(room);
    }
}

const MAX_FILE_SIZE = 2*1024*1024;

class Sidebar {
    private map: L.Map;
    private sidebar: L.Control.Sidebar;
    private floorsLayer: LFloors | null;
    private pathLayers: Set<LSomeLayerWithFloor>;

    private mapData: MapData;

    private fromRoom: Room | null;
    private toRoom: Room | null;
    private fromInput: HTMLInputElement;
    private toInput: HTMLInputElement;

    constructor(map: L.Map, mapData: MapData) {
        this.map = map;
        this.sidebar = L.control.sidebar({
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.floorsLayer = null;
        this.map.eachLayer((layer) => {
            // @ts-ignore: Truthy if layer is LFloors, otherwise falsy
            // TODO: Can instanceof be used here?
            if (layer.getDefaultFloor) {
                this.floorsLayer = <LFloors> layer;
            }
        });

        this.mapData = mapData;

        const roomSearch = new RoomSearch(mapData);
        this.sidebar.addPanel(this.createSearchPanel(roomSearch));

        this.fromRoom = null;
        this.toRoom = null;

        const [navPanel, fromInput, toInput] = this.createNavPanel(roomSearch);
        this.fromInput = fromInput;
        this.toInput = toInput;
        this.sidebar.addPanel(navPanel);

        this.sidebar.addPanel(this.createSchedulePanel(roomSearch));

        this.sidebar.addPanel(this.createSettingsPanel());
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
            roomSearch.search(searchBar.value).updateElementWithResults(resultContainer, (result) => {
                const room = result.getRoom();
                thiz.openInfoForRoom(room);
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

    // Info panel
    private createInfoPanel(room: Room): L.Control.PanelOptions {
        const paneElements = [];

        this.createInfoPanelHeader(paneElements, room);

        const roomFloor = Sidebar.elWithText("span", `Floor: ${room.getFloorNumber()}`);
        paneElements.push(roomFloor);

        const names = room.getNames();
        if (names.length > 0) {
            const roomNamesDesc = Sidebar.elWithText("h3", "Known as:");
            paneElements.push(roomNamesDesc);

            const roomNames = document.createElement("ul");
            for (const name of names) {
                const roomName = Sidebar.elWithText("li", name);
                roomNames.appendChild(roomName);
            };
            paneElements.push(roomNames);
        }

        const infoPane = Sidebar.createPaneElement("Room Info", paneElements);

        return {
            id: "info",
            tab: "<i class=\"fas fa-info\"></i>",
            title: "Room Info",
            pane: infoPane
        };
    }
    
    // Schedule panel
    private createSchedulePanel(roomSearch: RoomSearch): L.Control.PanelOptions {
        const inputsContainer = document.createElement("div");
        inputsContainer.classList.add("wrapper");
        inputsContainer.classList.add("input-wrapper");

        function makeUpdatePeriod(period: string): (room?: Room) => void {
            return (room?: Room): void => {
                console.log("Room", room);
                settings.updateData(period, room ? room.getRoomNumber() : "");
            };
        }

        for (const [id, name, title] of [
            ["pd1", "Pd. 1", undefined],
            ["pd2", "Pd. 2", undefined],
            ["pd3", "Pd. 3", undefined],
            ["pd4", "Pd. 4", undefined],
            ["pd5", "Lunch", "Pd. 5"],
            ["pd6", "Pd. 6", undefined],
            ["pd7", "Pd. 7", undefined],
            ["pd9", "Pd. 9", undefined],
            ["hr", "HR", "Homeroom"],
        ]) {
            const update1 = makeUpdatePeriod(id);
            const [pd1InputContainer, pd1Input] = Sidebar.createAutocompleteBox(name, roomSearch, update1, update1, title);
            settings.addWatcher(id, new Watcher((newValue: string) => {
                pd1Input.value = newValue ? newValue : "";
            }));
            inputsContainer.appendChild(pd1InputContainer);
        }
        
        const searchPane = Sidebar.createPaneElement("Schedule", [inputsContainer]);

        return {
            id: "schedule",
            tab: "<i class=\"fas fa-calendar-alt\"></i>",
            title: "Schedule",
            pane: searchPane
        };
    }

    private createInfoPanelHeader(paneElements: HTMLElement[], room: Room) {
        const header = document.createElement("div");
        header.classList.add("wrapper");
        header.classList.add("header-wrapper");
        paneElements.push(header);

        const roomName = document.createElement("h2");
        const roomNameText = document.createTextNode(room.getName());
        roomName.appendChild(roomNameText);
        header.appendChild(roomName);

        const thiz = this;

        const viewRoomButton = Sidebar.button("fa-map-pin", () => {
            thiz.moveToRoom(room);
        }, "Show room");
        viewRoomButton.classList.add("push-right");
        header.appendChild(viewRoomButton);

        const navButton = Sidebar.button("fa-location-arrow", () => {
            thiz.navigateTo(room);
        }, "Navigate");
        header.appendChild(navButton);
    }

    public openInfoForRoom(room: Room) {
        this.sidebar.removePanel("info");
        this.sidebar.addPanel(this.createInfoPanel(room));
        this.sidebar.open("info");
        this.moveToRoom(room);
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
            roomSearch.search(fromInput.value).updateElementWithResults(resultContainer, (result) => {
                const room = result.getRoom();
                thiz.navigateFrom(room);
                Sidebar.clearResults(resultContainer);
            });
        });

        toInput.addEventListener("input", () => {
            roomSearch.search(toInput.value).updateElementWithResults(resultContainer, (result) => {
                const room = result.getRoom();
                thiz.navigateTo(room);
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

    public navigateTo(room: Room) {
        this.toRoom = room;
        if (!room) {
            this.toInput.value = "";
        } else {
            this.toInput.value = room.getName();
        }
        this.sidebar.open("nav");

        this.calcNavIfNeeded();
    }

    public navigateFrom(room: Room) {
        this.fromRoom = room;
        if (!room) {
            this.fromInput.value = "";
        } else {
            this.fromInput.value = room.getName();
        }
        this.sidebar.open("nav");

        this.calcNavIfNeeded();
    }

    public swapNav() {
        const from = this.fromRoom;
        this.navigateFrom(this.toRoom);
        this.navigateTo(from);
    }

    private calcNavIfNeeded() {
        if (this.fromRoom && this.toRoom) {
            this.clearNav();
            this.pathLayers = this.mapData.createLayerGroupsFromPath(this.mapData.findBestPath(this.fromRoom, this.toRoom));
            if (this.floorsLayer !== undefined) {
                for (const layer of this.pathLayers) {
                    this.floorsLayer.addLayer(layer);
                }
            }
        }
    }

    private clearNav() {
        if (this.pathLayers !== undefined) {
            for (const layer of this.pathLayers) {
                this.floorsLayer.removeLayer(layer);
            }
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
    private moveToRoom(room: Room, openPopup: boolean = false) {
        const location = room.getCenter();
        this.map.setView([location[1], location[0]], 3);
        if (this.floorsLayer !== null) {
            this.floorsLayer.setFloor(room.getFloorNumber());
        }
        if (openPopup) {
            room.getNumberMarker().openPopup();
        }
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

    /**
     * Create a box with room name/number autocomplete
     * @param label 
     * @param roomSearch 
     * @param onSelectRoom 
     * @param onNoRoomSelected 
     * @param title 
     * @returns Autocomplete container element, input element
     */
    private static createAutocompleteBox(
        label: string,
        roomSearch: RoomSearch,
        onSelectRoom?: (room: Room) => void,
        onNoRoomSelected?: () => void,
        title?: string
    ): [HTMLElement, HTMLInputElement] {
        const container = document.createElement("div");
        container.classList.add("wrapper");
        container.classList.add("input-wrapper");

        const inputContainer = document.createElement("div");
        inputContainer.classList.add("wrapper");

        const inputLabel = Sidebar.elWithText("label", label);
        inputLabel.classList.add("leaflet-style");
        inputLabel.classList.add("no-border");
        inputLabel.classList.add("nav-label");
        if (title) {
            inputLabel.setAttribute("title", title);
        }
        inputContainer.appendChild(inputLabel);

        const input = genTextInput();
        inputContainer.appendChild(input);

        container.appendChild(inputContainer);

        // Result container
        // Attached to the text box, disappears when the box loses focus
        const resultContainer = document.createElement("div");
        resultContainer.classList.add("wrapper");
        resultContainer.classList.add("results-wrapper");
        resultContainer.classList.add("leaflet-style");
        resultContainer.classList.add("hidden");
        container.appendChild(resultContainer);

        let roomSelected = false;
        input.addEventListener("input", () => {
            roomSelected = false;
            roomSearch.search(input.value).updateElementWithResults(resultContainer, (result) => {
                input.value = result.getRoom().getRoomNumber();
                resultContainer.classList.add("hidden");
                console.log("test");
                if (onSelectRoom) {
                    console.log("Result");
                    console.log(result);
                    onSelectRoom(result.getRoom());
                }
                roomSelected = true;
            });
        });
        
        return [container, input];
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
