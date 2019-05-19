import * as L from "leaflet";

import Room from "../ts/Room";

import "./search.scss";

export default class LSearch extends L.Control {
    private searchHandler: (query: string) => SearchResult[];
    private selectHandler: (choice: SearchResult) => void;
    private fromToChangeHandler: (from: Room, to: Room) => void;

    private results: HTMLDivElement;

    private from: Room;
    private to: Room;

    constructor(
        searchHandler: (query: string) => SearchResult[],
        selectHandler: (choice: SearchResult) => void,
        fromToChangeHandler: (from: Room, to: Room) => void,
        options?: L.ControlOptions) {
        super(options);
        this.searchHandler = searchHandler;
        this.selectHandler = selectHandler;
        this.fromToChangeHandler = fromToChangeHandler;
    }

    static lSearch(
        searchHandler: (query: string) => SearchResult[],
        selectHandler: (choice: SearchResult) => void,
        fromToChangeHandler: (from: Room, to: Room) => void,
        options?: L.ControlOptions): LSearch {
        return new LSearch(searchHandler, selectHandler, fromToChangeHandler, options);
    }

    initialize(options: L.ControlOptions): void {
        L.Util.setOptions(this, options);
    }

    onSearch(query: string) {
        const results = this.searchHandler(query);

        while (this.results.hasChildNodes()) {
            this.results.removeChild(this.results.firstChild);
        }

        this.results.classList.remove("hidden");

        if (results.length > 0) {
            const list = document.createElement("ul");
            for (const result of results) {
                const element = result.createHtml(this);
                element.addEventListener("click", () => {
                    this.onSelect(result);
                })
                list.appendChild(element);
            }

            this.results.appendChild(list);
        } else {
            const noResults = document.createTextNode("No results");
            this.results.appendChild(noResults);
        }
    }

    onSelect(choice: SearchResult) {
        this.selectHandler(choice);
    }

    onAdd(map: L.Map) {
        // Create the container element
        const controlElement = document.createElement("div");
        controlElement.classList.add("leaflet-control-search");
        controlElement.classList.add("leaflet-bar");

        // Create a wrapper for the search bar
        const barWrapper = document.createElement("div");
        barWrapper.classList.add("search-bar-wrapper");
        controlElement.appendChild(barWrapper);

        // Create search bar
        const searchBar = document.createElement("input");
        searchBar.classList.add("search-bar");
        searchBar.setAttribute("placeholder", "Search");
        barWrapper.appendChild(searchBar);

        // Create search button
        const searchButton = document.createElement("a");
        searchButton.classList.add("search");
        searchButton.setAttribute("role", "button");
        searchButton.setAttribute("aria-label", "Search");
        searchButton.appendChild(document.createTextNode("🔍"));
        barWrapper.appendChild(searchButton);

        // Create a wrapper for search results
        this.results = document.createElement("div");
        this.results.classList.add("results-wrapper");
        this.results.classList.add("hidden");
        controlElement.appendChild(this.results);

        // Add events
        searchBar.addEventListener("keydown", (e) => {
            if (e.keyCode === 13) {
                this.onSearch(searchBar.value);
            }
        });

        searchButton.addEventListener("click", () => {
            this.onSearch(searchBar.value);
        });

        L.DomEvent.disableClickPropagation(controlElement);
        L.DomEvent.disableScrollPropagation(controlElement);

        return controlElement;
    }
    
    setFrom(from: Room) {
        this.from = from;
        this.fromToChangeHandler(this.from, this.to);
    }

    setTo(to: Room) {
        this.to = to;
        this.fromToChangeHandler(this.from, this.to);
    }

    getFrom(): Room {
        return this.from;
    }

    getTo(): Room {
        return this.to;
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

    createHtml(search: LSearch): HTMLElement {
        const container = document.createElement("li");
        container.classList.add("search-result");
        container.appendChild(document.createTextNode(this.room.getRoomNumber()));

        const navLinks = document.createElement("div");
        navLinks.classList.add("nav-links");
        container.appendChild(navLinks);

        const fromLink = document.createElement("a");
        fromLink.setAttribute("href", "#");
        fromLink.setAttribute("title", "Navigate from");
        fromLink.appendChild(document.createTextNode("➚"));
        fromLink.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            search.setFrom(this.room);
        });
        navLinks.appendChild(fromLink);

        const toLink = document.createElement("a");
        toLink.setAttribute("href", "#");
        toLink.setAttribute("title", "Navigate to");
        toLink.appendChild(document.createTextNode("➘"));
        toLink.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation()
            search.setTo(this.room);
        });
        navLinks.appendChild(toLink);

        return container;
    }
}