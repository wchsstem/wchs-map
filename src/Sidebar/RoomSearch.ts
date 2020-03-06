import MiniSearch from "minisearch";

import Room from "../ts/Room";
import MapData from "../ts/MapData";

export class RoomSearch {
    private mapData: MapData;
    private miniSearch: any;

    constructor(mapData: MapData) {
        this.mapData = mapData;
        this.miniSearch = new MiniSearch({
            "fields": ["names", "roomNumber"],
            "extractField": (room: Room, fieldName: string) => {
                const value = room[fieldName];
                // Turn arrays (names) into space seperated string
                return Array.isArray(value) ? value.join(" ") : value;
            },
            "searchOptions": {
                "prefix": true
            },
            "idField": "roomNumber"
        });
        this.miniSearch.addAll(this.mapData.getAllRooms());
    }

    public search(query: string): SearchResults {
        const results = this.miniSearch.search(query).map((result: { "id": string }) => {
            return new SearchResult(this.mapData.getRoom(result.id));
        });
        
        return new SearchResults(query, results);
    }
}

export class SearchResults {
    private query: string;
    private searchResults: SearchResult[];

    constructor(query: string, searchResults: SearchResult[]) {
        this.query = query;
        this.searchResults = searchResults;
    }

    public updateElementWithResults(resultsEl: HTMLElement, onClickResult: (result: SearchResult) => void) {
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
                    onClickResult(result);
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
