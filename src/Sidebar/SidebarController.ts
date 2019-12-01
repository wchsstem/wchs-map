import * as L from "leaflet";
import { RoomSearch } from "./RoomSearch";
import { genTextInput } from "../GenHtml/GenHtml";
import MapData from "../ts/MapData";

import "./sidebar.scss";
import Room from "../ts/Room";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";

export function createSidebar(map: L.Map, mapData: MapData) {
    new Sidebar(map, mapData);
}

class Sidebar {
    private map: L.Map;
    private sidebar: L.Control.Sidebar;
    private floorsLayer: LFloors | null;

    constructor(map: L.Map, mapData: MapData) {
        this.map = map;
        this.sidebar = L.control.sidebar({
            autopan: true,
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.floorsLayer = null;
        this.map.eachLayer((layer) => {
            // @ts-ignore: Truthy if layer is LFloors, otherwise falsy
            if (layer.getDefaultFloor) {
                this.floorsLayer = <LFloors> layer;
            }
        });

        const roomSearch = new RoomSearch(mapData);
        this.sidebar.addPanel(this.createSearchPanel(roomSearch));
    }

    // Search panel
    private createSearchPanel(roomSearch: RoomSearch) {
        const searchBarContainer = document.createElement("div");
        searchBarContainer.classList.add("search-wrapper");

        const searchBar = genTextInput("Search");
        searchBarContainer.appendChild(searchBar);

        const resultContainer = document.createElement("div");
        resultContainer.classList.add("results-wrapper");
        resultContainer.classList.add("leaflet-style");
        resultContainer.classList.add("hidden");

        const thiz = this;
        searchBar.addEventListener("input", () => {
            roomSearch.search(searchBar.value).updateElementWithResults(resultContainer, (result) => {
                const room = result.getRoom();
                thiz.sidebar.removePanel("info");
                thiz.sidebar.addPanel(this.createInfoPanel(room));
                thiz.sidebar.open("info");
                thiz.moveToRoom(room);
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
    private createInfoPanel(room: Room) {
        const paneElements = [];

        const roomName = document.createElement("h2");
        const roomNameText = document.createTextNode(room.getName());
        roomName.appendChild(roomNameText);
        paneElements.push(roomName);

        const roomFloor = document.createElement("span");
        const roomFloorText = document.createTextNode(`Floor: ${room.getFloorNumber()}`);
        roomFloor.appendChild(roomFloorText);
        paneElements.push(roomFloor);

        const names = room.getNames();
        if (names.length > 0) {
            const roomNamesDesc = document.createElement("h3");
            const roomNamesDescText = document.createTextNode("Known as:");
            roomNamesDesc.appendChild(roomNamesDescText);
            paneElements.push(roomNamesDesc);

            const roomNames = document.createElement("ul");
            for (const name of names) {
                const roomName = document.createElement("li");
                const roomNameText = document.createTextNode(name);
                roomName.appendChild(roomNameText);
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
}
