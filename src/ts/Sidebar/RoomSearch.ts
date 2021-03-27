import MiniSearch from "minisearch";

import Room from "../Room";
import MapData from "../MapData";

export class RoomSearch {
    private mapData: MapData;
    private miniSearch: MiniSearch;

    constructor(mapData: MapData) {
        this.mapData = mapData;
        this.miniSearch = new MiniSearch({
            "fields": ["names", "roomNumber"],
            "extractField": (room: Room, fieldName: string) => {
                // @ts-ignore
                const value = room[fieldName];
                // Turn arrays (names) into space separated string
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

        while (resultsEl.firstChild !== null) {
            resultsEl.removeChild(resultsEl.firstChild);
        }

        const list = document.createElement("ul");
        if (this.searchResults.length > 0) {
            for (const result of this.searchResults) {
                const element = result.createHtml();
                element.addEventListener("click", () => {
                    onClickResult(result);
                });
                list.appendChild(element);
            }
        } else {
            const container = document.createElement("li");
            container.classList.add("search-result");

            const noResults = document.createTextNode("No results");
            container.appendChild(noResults);

            list.appendChild(container);
        }
        resultsEl.appendChild(list);
    }
}

export class SearchResult {
    private room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    public getRoomNumber(): string {
        return this.room.roomNumber;
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
