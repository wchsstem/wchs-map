import MiniSearch from "minisearch";

import Room from "../ts/Room";
import MapData from "../ts/MapData";
import { SidebarController } from "./SidebarControl";

export class SearchState {
    private sidebarController: SidebarController;
    private map: MapData;
    private miniSearch: any;
    private resultsEl: HTMLElement;

    constructor(sidebarController: SidebarController, map: MapData, resultsEl: HTMLElement) {
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
        this.resultsEl = resultsEl;
    }

    public onSearch(query: string) {
        if (query === "") {
            this.resultsEl.classList.add("hidden");
            return;
        }

        const searchResults = this.searchHandler(query);

        this.resultsEl.classList.remove("hidden");

        while (this.resultsEl.hasChildNodes()) {
            this.resultsEl.removeChild(this.resultsEl.firstChild);
        }

        if (searchResults.length > 0) {
            const list = document.createElement("ul");
            for (const result of searchResults) {
                const element = result.createHtml();
                element.addEventListener("click", () => {
                    this.selectHandler(result);
                });
                list.appendChild(element);
            }

            this.resultsEl.appendChild(list);
        } else {
            const noResults = document.createTextNode("No results");
            this.resultsEl.appendChild(noResults);
        }
    }

    private searchHandler(query: string): SearchResult[] {
        const results = this.miniSearch.search(query).map((result: { "id": string }) => {
            return new SearchResult(this.map.getRoom(result.id));
        });
        
        return results;
    }

    private selectHandler(result: SearchResult) {
        const room = result.getRoom();
        this.sidebarController.moveToRoom(room, true);
    }
}

export class SearchResult {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    getRoomNumber(): string {
        return this.room.getRoomNumber();
    }

    getRoom(): Room {
        return this.room;
    }

    createHtml(): HTMLElement {
        const container = document.createElement("li");
        container.classList.add("search-result");
        container.appendChild(document.createTextNode(this.room.getName()));

        return container;
    }
}
