import { control } from "leaflet"

import { RoomSearch } from "./RoomSearch";
import { genPaneElement, genTextInput } from "../GenHtml/GenHtml";
import MapData from "../ts/MapData";

import "./sidebar.scss";
import Room from "../ts/Room";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { dropdownData, metaSettings, settingCategories, settingInputType, settings, Watcher } from "../ts/settings";
import { Synergy } from "../Synergy/Synergy";
import { GeocoderDefinition, GeocoderSuggestion } from "../ts/Geocoder";
import { BuildingLocationWithEntrances } from "../ts/BuildingLocation";
import { geocoder } from "../ts/utils";
import { fromMap, None, Option, Some } from "@nvarner/monads";
import { T2 } from "../ts/Tuple";
import { NavigationPane } from "../NavigationPane/NavigationPane";
import { Logger, LogPane } from "../LogPane/LogPane";

let sidebar: Option<Sidebar> = None;

export function createSidebar(map: L.Map, mapData: MapData, logger: Logger): void {
    sidebar = Some(new Sidebar(map, mapData, logger));
}

export function showRoomInfo(room: Room): void {
    sidebar.ifSome(sidebar => sidebar.openInfoForName(room.getName()));
}

const MAX_FILE_SIZE = 2*1024*1024;

export class Sidebar {
    private readonly map: L.Map;
    private readonly sidebar: L.Control.Sidebar;
    private readonly navigationPane: NavigationPane;

    private floorsLayer: Option<LFloors>;

    constructor(map: L.Map, mapData: MapData, logger: Logger) {
        this.map = map;
        this.sidebar = control.sidebar({
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.floorsLayer = None;
        this.map.eachLayer((layer) => {
            if (layer instanceof LFloors) {
                this.floorsLayer = Some(<LFloors> layer);
            }
        });

        const roomSearch = new RoomSearch(mapData);
        this.sidebar.addPanel(this.createSearchPanel(roomSearch));

        this.navigationPane = NavigationPane.new(geocoder, mapData, () => this.sidebar.open("nav"));
        this.navigationPane.addTo(map, this.sidebar);

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
                this.sidebar.addPanel(this.createSynergyPanel());
            } else {
                this.sidebar.removePanel("synergy");
            }
        }));
    }

    // Synergy panel
    private createSynergyPanel(): L.Control.PanelOptions {
        const beta = Sidebar.elWithText("p", "Currently in alpha. Doesn't fully work yet.");
        const info = Sidebar.elWithText("p", "Download your Synergy page and upload the HTML file here.");

        const siteUpload = document.createElement("input");
        siteUpload.setAttribute("type", "file");
        siteUpload.setAttribute("accept", "text/html");

        const errorBox = document.createElement("p");
        const courses = document.createElement("ol");

        siteUpload.addEventListener("change", () => {
            if (siteUpload.files === null || siteUpload.files.length === 0) {
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
                if (result.target === null || result.target.result === null) {
                    errorBox.innerText = "There was an error loading the file.";
                    return;
                }

                const synergyPage = result.target.result.toString();
                const synergy = new Synergy(synergyPage);
                for (const course of synergy.getCourses()) {
                    courses.appendChild(course.toHtmlLi());
                }
            });

            reader.readAsText(file);
        });
            
        const synergyPane = genPaneElement("Synergy", [beta, info, siteUpload, errorBox, courses]);

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
            Sidebar.updateWithResults(query, results, resultContainer, (result) => {
                thiz.openInfoForName(result.name);
            });
        });

        const searchPane = genPaneElement("Search", [searchBarContainer, resultContainer]);

        return {
            id: "search",
            tab: "<i class=\"fas fa-search-location\"></i>",
            title: "Search",
            pane: searchPane
        };
    }

    // Info panel
    private createInfoPanel(definition: GeocoderDefinition<BuildingLocationWithEntrances>): L.Control.PanelOptions {
        const paneElements: HTMLElement[] = [];

        this.createInfoPanelHeader(paneElements, definition);

        const roomFloor = Sidebar.elWithText("span", `Floor: ${definition.location.getCenter().floor}`);
        paneElements.push(roomFloor);

        if (definition.description.length !== 0) {
            const descriptionEl = document.createElement("p");
            const descriptionText = document.createTextNode(definition.description);
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
            thiz.navigationPane.navigateTo(Some(definition), true, true);
        }, "Navigate");
        header.appendChild(navButton);
    }

    public openInfoForName(name: string) {
        geocoder.getDefinitionFromName(name).ifSome(location => {
            this.sidebar.removePanel("info");
            this.sidebar.addPanel(this.createInfoPanel(location));
            this.sidebar.open("info");
            this.moveToDefinedLocation(location);
        });
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

        const hiddenSettings: String[] = metaSettings.getSetting("hidden-settings").unwrap() as String[];
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
    private moveToDefinedLocation(definition: GeocoderDefinition<BuildingLocationWithEntrances>): void {
        const location = definition.location.getCenter();
        // TODO: Better option than always using zoom 3?
        this.map.setView(location.xy, 3);
        this.floorsLayer.ifSome(floorsLayer => floorsLayer.setFloor(location.floor));
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

    private static updateWithResults(
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

        while (resultContainer.firstChild !== null) {
            resultContainer.removeChild(resultContainer.firstChild);
        }

        const list = document.createElement("ul");
        if (results.length > 0) {
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
            const container = document.createElement("li");
            container.classList.add("search-result");

            const noResults = document.createTextNode("No results");
            container.appendChild(noResults);

            list.appendChild(container);

            resultContainer.appendChild(list);
        }
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
