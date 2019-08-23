import MiniSearch from "minisearch";

import Room from "../ts/Room";
import MapData from "../ts/MapData";
import { SidebarController } from "./SidebarController";

export class RoomSearch {
    private sidebarController: SidebarController;
    private map: MapData;
    private miniSearch: any;

    constructor(sidebarController: SidebarController, map: MapData) {
        this.sidebarController = sidebarController;
        this.map = map;
        this.miniSearch = new MiniSearch({
            "fields": ["namesAsString", "roomNumber"],
            "searchOptions": {
                "prefix": true
            },
            "idField": "roomNumber"
        });
        this.miniSearch.addAll(this.map.getAllRooms());
    }

    public search(query: string): SearchResults {
        const results = this.miniSearch.search(query).map((result: { "id": string }) => {
            return new SearchResult(this.map.getRoom(result.id));
        });
        
        return new SearchResults(query, results, this.sidebarController);
    }
}

export class SearchResults {
    private query: string;
    private searchResults: SearchResult[];
    private sidebarController: SidebarController;

    constructor(query: string, searchResults: SearchResult[], sidebarController: SidebarController) {
        this.query = query;
        this.searchResults = searchResults;
        this.sidebarController = sidebarController;
    }

    public updateElementWithResults(resultsEl: HTMLElement) {
        if (this.query === "") {
            resultsEl.classList.add("hidden");
            return;
        }

        resultsEl.classList.remove("hidden");

        while (resultsEl.hasChildNodes()) {
            resultsEl.removeChild(resultsEl.firstChild);
        }

        if (this.searchResults.length > 0) {
            const list = document.createElement("ul");
            for (const result of this.searchResults) {
                const element = result.createHtml();
                element.addEventListener("click", () => {
                    const room = result.getRoom();
                    this.sidebarController.moveToRoom(room, true);
                });
                list.appendChild(element);
            }

            resultsEl.appendChild(list);
        } else {
            const noResults = document.createTextNode("No results");
            resultsEl.appendChild(noResults);
        }
    }
}

export class SearchResult {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    public getRoomNumber(): string {
        return this.room.getRoomNumber();
    }

    public getRoom(): Room {
        return this.room;
    }

    public createHtml(): HTMLElement {
        const container = document.createElement("li");
        container.classList.add("search-result");
        container.appendChild(document.createTextNode(this.room.getName()));

        return container;
    }
}
