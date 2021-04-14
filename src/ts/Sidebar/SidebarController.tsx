import { control } from "leaflet";

import { RoomSearch } from "./RoomSearch";
import { genPaneElement, genTextInput } from "../GenHtml/GenHtml";
import MapData from "../MapData";
import { h } from "../JSX";

import "./sidebar.scss";
import Room from "../Room";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { dropdownData, metaSettings, settingCategories, settingInputType, settings, Watcher } from "../settings";
import { Geocoder, GeocoderDefinition } from "../Geocoder";
import { fromMap, None, Option, Some } from "@nvarner/monads";
import { T2 } from "../Tuple";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Logger, LogPane } from "../LogPane/LogPane";
import { Locator } from "../Locator";
import { SynergyPane } from "./SynergyPane/SynergyPane";
import { Pane } from "./Pane";
import { SearchPane } from "./SearchPane/SearchPane";

export class Sidebar {
    private readonly map: L.Map;
    private readonly geocoder: Geocoder;
    private readonly mapData: MapData;
    private readonly locator: Locator;

    private readonly sidebar: L.Control.Sidebar;
    private readonly navigationPane: NavigationPane;
    private readonly floorsLayer: LFloors;

    private readonly logger: Logger;

    constructor(map: L.Map, mapData: MapData, geocoder: Geocoder, locator: Locator, logger: Logger, floorsLayer: LFloors) {
        this.map = map;
        this.sidebar = control.sidebar({
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.geocoder = geocoder;
        this.mapData = mapData;
        this.locator = locator;
        this.logger = logger;
        this.floorsLayer = floorsLayer;

        this.navigationPane = NavigationPane.new(geocoder, mapData, floorsLayer, () => this.sidebar.open("nav"));

        const searchPane = new SearchPane(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            this,
            this.navigationPane,
            result => {
                this.openInfoForName(geocoder, result.name);
            }
        );
        
        this.addPane(searchPane);
        this.navigationPane.addTo(map, this.sidebar);

        const synergyPane = new SynergyPane(geocoder, logger);

        this.sidebar.addPanel(this.createSettingsPanel());

        const logPane = LogPane.new();
        logger.associateWithLogPane(logPane);

        settings.addWatcher("logger", new Watcher(enable => {
            if (enable) {
                this.sidebar.addPanel(logPane.getPanelOptions());
            } else {
                this.sidebar.removePanel(logPane.getId());
            }
        }));

        settings.addWatcher("synergy", new Watcher((enable) => {
            if (enable) {
                this.addPane(synergyPane);
            } else {
                this.removePane(synergyPane);
            }
        }));
    }

    private addPane(pane: Pane) {
        this.sidebar.addPanel(pane.getPanelOptions());
    }

    private removePane(pane: Pane) {
        this.sidebar.removePanel(pane.getPaneId());
    }

    // Info panel
    private createInfoPanel(definition: GeocoderDefinition): L.Control.PanelOptions {
        const paneElements: HTMLElement[] = [];

        this.createInfoPanelHeader(paneElements, definition);

        const roomFloor = Sidebar.elWithText("span", `Floor: ${definition.getLocation().getFloor()}`);
        paneElements.push(roomFloor);

        if (definition.getDescription.length !== 0) {
            const descriptionEl = document.createElement("p");
            const descriptionText = document.createTextNode(definition.getDescription());
            descriptionEl.appendChild(descriptionText);
            paneElements.push(descriptionEl);
        }

        const infoPane = genPaneElement("Room Info", paneElements);

        return {
            id: "info",
            tab: "<i class=\"fas fa-info\"></i>",
            title: "Room Info",
            pane: infoPane
        };
    }

    private createInfoPanelHeader(paneElements: HTMLElement[], definition: GeocoderDefinition) {
        const header = document.createElement("div");
        header.classList.add("wrapper");
        header.classList.add("header-wrapper");
        paneElements.push(header);

        const roomName = document.createElement("h2");
        const roomNameText = document.createTextNode(definition.getName());
        roomName.appendChild(roomNameText);
        header.appendChild(roomName);

        const thiz = this;

        const viewRoomButton = Sidebar.button("fa-map-pin", () => {
            thiz.moveToDefinedLocation(definition);
        }, "Show room");
        viewRoomButton.classList.add("push-right");
        header.appendChild(viewRoomButton);

        const navButton = Sidebar.button("fa-location-arrow", () => {
            thiz.navigationPane.navigateTo(Some(definition), true, true);
        }, "Navigate");
        header.appendChild(navButton);
    }

    public openInfo(definition: GeocoderDefinition) {
        this.sidebar.removePanel("info");
        this.sidebar.addPanel(this.createInfoPanel(definition));
        this.sidebar.open("info");
        this.moveToDefinedLocation(definition);
    }

    public openInfoForName(geocoder: Geocoder, name: string) {
        geocoder.getDefinitionFromName(name).ifSome(location => this.openInfo(location));
    }

    // Settings panel
    private createSettingsPanel(): L.Control.PanelOptions {
        const settingsContainer = document.createElement("ul");
        settingsContainer.classList.add("wrapper");
        settingsContainer.classList.add("settings-container");

        let watchers: [string, Watcher][] = [];

        while (settingsContainer.firstChild !== null) {
            settingsContainer.removeChild(settingsContainer.firstChild);
        }
        watchers.forEach(([id, watcher]) => settings.removeWatcher(id, watcher));
        watchers = [];

        const nameMapping: Map<string, string> = metaSettings.getSetting("name-mapping").unwrap() as Map<string, string>;

        settingCategories.forEach((categorySettings, category) => {
            const categoryContainer = document.createElement("li");

            const categoryHeader = document.createElement("h2");
            const categoryHeaderText = document.createTextNode(category);
            categoryHeader.appendChild(categoryHeaderText);
            categoryContainer.appendChild(categoryHeader);

            settingsContainer.appendChild(categoryContainer);

            const categorySettingsContainer = document.createElement("ul");
            settingsContainer.appendChild(categorySettingsContainer);

            categorySettings.forEach(name => {
                const container = document.createElement("li");
                container.classList.add("setting-container");
                categorySettingsContainer.appendChild(container);
                const watcher = new Watcher(data => {
                    while (container.firstChild !== null) {
                        container.removeChild(container.firstChild);
                    }

                    let setting = null;
                    if (typeof data === "string") {
                        const inputType = fromMap(settingInputType, name);
                        const maybeSetting: Option<HTMLElement> = inputType.match({
                            some: (type) => {
                                if (type === "dropdown") {
                                    // Assume exists
                                    const optionDisplayAndIds = fromMap(dropdownData, name).unwrap();
                                    return Some(Sidebar.createDropdownSetting(name, data, optionDisplayAndIds, nameMapping));
                                } else {
                                    return None;
                                }
                            },
                            none: () => None
                        });
                        setting = maybeSetting.match({
                            some: (s) => s,
                            none: () => Sidebar.createStringSetting(name, data, nameMapping)
                        });
                    } else if (typeof data === "boolean") {
                        setting = Sidebar.createBooleanSetting(name, data, nameMapping);
                    }
                    if (setting !== null) {
                        container.appendChild(setting);
                    }
                });
                watchers.push([name, watcher]);
                settings.addWatcher(name, watcher);
            });
        });

        const settingsPane = genPaneElement("Settings", settingsContainer);

        return {
            id: "settings",
            tab: "<i class=\"fas fa-cog\"></i>",
            title: "Settings",
            pane: settingsPane,
            position: "bottom"
        };
    }

    private static createSetting(name: string, control: HTMLElement): HTMLDivElement {
        const container = document.createElement("div");

        container.appendChild(Sidebar.elWithText("label", name));
        container.appendChild(control);

        return container;
    }

    private static createStringSetting(name: string, value: string, nameMapping: Map<string, string>): HTMLDivElement {
        const control = genTextInput("", value);
        control.addEventListener("change", () => {
            settings.updateData(name, control.value);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return Sidebar.createSetting(mappedName, control);
    }

    private static createBooleanSetting(name: string, value: boolean, nameMapping: Map<string, string>): HTMLElement {
        const control = document.createElement("input");
        control.setAttribute("type", "checkbox");
        control.checked = value;
        control.addEventListener("change", () => {
            settings.updateData(name, control.checked);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return Sidebar.createSetting(mappedName, control);
    }

    private static createDropdownSetting(name: string, value: string, optionDisplayAndIds: T2<string, string>[], nameMapping: Map<string, string>): HTMLElement {
        const control = document.createElement("select");
        for (const displayAndId of optionDisplayAndIds) {
            const display = displayAndId.e0;
            const id = displayAndId.e1;

            const option = document.createElement("option");
            option.setAttribute("value", id);
            if (id == value) {
                option.setAttribute("selected", "selected");
            }

            const displayText = document.createTextNode(display);

            option.appendChild(displayText);
            control.appendChild(option);
        }

        control.addEventListener("change", (e) => {
            settings.updateData(name, control.value);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return Sidebar.createSetting(mappedName, control);
    }

    // Utils
    private moveToDefinedLocation(definition: GeocoderDefinition): void {
        const location = definition.getLocation();
        // TODO: Better option than always using zoom 3?
        this.map.setView(location.getXY(), 3);
        this.floorsLayer.setFloor(location.getFloor());
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
        while (resultContainer.firstChild !== null) {
            resultContainer.removeChild(resultContainer.firstChild);
        }
        resultContainer.classList.add("hidden");
    }



    // TODO
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
                input.value = result.getRoom().roomNumber;
                resultContainer.classList.add("hidden");
                if (onSelectRoom) {
                    onSelectRoom(result.getRoom());
                }
                roomSelected = true;
            });
        });

        return [container, input];
    }
}
