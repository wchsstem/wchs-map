import * as L from "leaflet";

import "./sidebar.scss";
import { genButton, genElText, genTextInput } from "../GenHtml/GenHtml";
import Room from "../ts/Room";
import MapData from "../ts/MapData";
import { RoomSearch } from "./RoomSearch";
import { LFloors, LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";

export enum SidebarState {
    SEARCH,
    NAVIGATION
}

export class SidebarController {
    private sidebar: HTMLElement;
    private state: SidebarState;
    private stateData: Map<string, any>;
    private map: MapData;
    private floorsLayer: LFloors;
    private leafletMap: L.Map;
    private pathLayers: Set<LSomeLayerWithFloor>;

    constructor(sidebar: HTMLElement, map: MapData, floorsLayer: LFloors, leafletMap: L.Map) {
        this.sidebar = sidebar;
        this.stateData = new Map();
        this.map = map;
        this.floorsLayer = floorsLayer;
        this.leafletMap = leafletMap;
        this.setState(SidebarState.SEARCH);
    }

    public getStateData(key: string): any {
        return this.stateData.get(key);
    }

    public createHeader(title: string) {
        const label = genElText("h1", title);

        const closeButton = genButton("Close", () => {
            this.setState(SidebarState.SEARCH);
        });
        closeButton.classList.add("closeButton");

        const rootEl = document.createElement("div");
        rootEl.append(label);
        rootEl.append(closeButton);

        this.sidebar.append(rootEl);
    }

    public setState(state: SidebarState) {
        if (this.state == state) {
            return;
        }

        this.stateData.clear();

        this.sidebar.className = "";
        while (this.sidebar.hasChildNodes()) {
            this.sidebar.removeChild(this.sidebar.lastChild);
        }

        switch (state) {
            case SidebarState.SEARCH: {
                const roomSearch = new RoomSearch(this, this.map);

                const searchBar = genTextInput("Search");

                const rootEl = document.createElement("div");
                rootEl.appendChild(searchBar);

                this.sidebar.appendChild(rootEl);

                this.sidebar.classList.add("leaflet-control");
                L.DomEvent.disableClickPropagation(this.sidebar);
                L.DomEvent.disableScrollPropagation(this.sidebar);

                const results = document.createElement("div");
                results.classList.add("results-wrapper");
                results.classList.add("leaflet-style");
                results.classList.add("hidden");
                this.sidebar.appendChild(results);

                searchBar.addEventListener("input", () => {
                    roomSearch.search(searchBar.value)
                        .updateElementWithResults(results, (result) => {
                            const room = result.getRoom();
                            this.moveToRoom(room, true);
                        });
                });
                }
                break;
            case SidebarState.NAVIGATION: {
                const roomSearch = new RoomSearch(this, this.map);
                this.createHeader("Navigation");
                this.sidebar.classList.add("full");
                
                const fromInput = genTextInput("From");
                const toInput = genTextInput("To");

                const searchResults = document.createElement("div");
                searchResults.classList.add("results-wrapper");
                searchResults.classList.add("leaflet-style");
                searchResults.classList.add("hidden");

                fromInput.addEventListener("input", (e) => {
                    this.clearNav();
                    roomSearch.search(fromInput.value)
                        .updateElementWithResults(searchResults, (result) => {
                            this.setNavFrom(result.getRoom());
                            while (searchResults.hasChildNodes()) {
                                searchResults.removeChild(searchResults.lastChild);
                            }
                        });
                });

                toInput.addEventListener("input", () => {
                    this.clearNav();
                    roomSearch.search(toInput.value)
                        .updateElementWithResults(searchResults, (result) => {
                            this.setNavTo(result.getRoom());
                            while (searchResults.hasChildNodes) {
                                searchResults.removeChild(searchResults.lastChild);
                            }
                        });
                });

                this.stateData.set("fromInput", fromInput);
                this.stateData.set("toInput", toInput);

                this.sidebar.append(fromInput);
                this.sidebar.append(toInput);
                this.sidebar.append(searchResults);
                }
                break;
        }
        this.state = state;
    }

    public moveToRoom(room: Room, openPopup: boolean = false) {
        const location = room.getCenter() ? room.getCenter() :
            this.map.getGraph().getVertex(room.getEntrances()[0]).getLocation();
        this.leafletMap.setView([location[1], location[0]], 3);
        // TODO: Replace with floor info from Room
        this.floorsLayer.setFloor(room.getRoomNumber().charAt(0));
        if (openPopup) {
            room.getNumberMarker().openPopup();
        }
    }

    public setNavFrom(from: Room) {
        if (this.state !== SidebarState.NAVIGATION) {
            console.error("Cannot set nav from if state is not NAVIGATION");
            return;
        }

        this.stateData.set("from", from);
        const fromInput: HTMLInputElement = this.stateData.get("fromInput");
        fromInput.value = from.getName();

        this.calcNavIfNeeded();
    }

    public setNavTo(to: Room) {
        if (this.state !== SidebarState.NAVIGATION) {
            console.error("Cannot set nav to if state is not NAVIGATION");
            return;
        }

        this.stateData.set("to", to);
        const toInput: HTMLInputElement = this.stateData.get("toInput");
        toInput.value = to.getName();

        this.calcNavIfNeeded();
    }

    private calcNavIfNeeded() {
        const from = this.stateData.get("from");
        const to = this.stateData.get("to");

        if (from && to) {
            this.clearNav();

            const path = this.map.findBestPath(from, to);
            this.pathLayers = this.map.createLayerGroupsFromPath(path);
            for (const layer of this.pathLayers) {
                this.floorsLayer.addLayer(layer);
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
}