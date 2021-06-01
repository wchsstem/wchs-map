import { genPaneElement, genTextInput } from "../../GenHtml/GenHtml";
import { Geocoder, GeocoderDefinition, GeocoderSuggestion } from "../../Geocoder";
import { Pane } from "../Pane";
import { h } from "../../JSX";
import { ClosestBathroomButton } from "./ClosestBathroomButton";
import { ClosestBottleFillingStationButton } from "./ClosestBottleFillingStationButton";
import { Locator } from "../../Locator";
import { MapData } from "../../MapData";
import { LFloors } from "../../LFloorsPlugin/LFloorsPlugin";
import { BuildingLocation, BuildingLocationWithEntrances } from "../../BuildingLocation";
import { LocationOnlyDefinition } from "../../LocationOnlyDefinition";
import { NavigationPane } from "../NavigationPane/NavigationPane";
import { ClosestHandSanitizerStationButton } from "./ClosestHandSanitizerStationButton";
import { ClosestBleedingControlKitButton } from "./ClosestBleedingControlKitButton";
import { ClosestAedButton } from "./ClosestAedButton";
import { ClosestAhuButton } from "./ClosestAhuButton";
import { ClosestEcButton } from "./ClosestEcButton";
import { ClosestBscButton } from "./ClosestBscButton";
import { Some } from "@nvarner/monads";
import { Sidebar } from "../SidebarController";
import { ISettings } from "../../settings/ISettings";

export class SearchPane extends Pane {
    private readonly pane: HTMLElement;
    private readonly resultContainer: HTMLElement;

    private readonly sidebarController: Sidebar;
    private readonly navigationPane: NavigationPane;

    public constructor(
        geocoder: Geocoder,
        locator: Locator,
        settings: ISettings,
        mapData: MapData,
        floorsLayer: LFloors,
        sidebarController: Sidebar,
        navigationPane: NavigationPane,
        onClickResult: (result: GeocoderSuggestion) => void
    ) {
        super();

        this.sidebarController = sidebarController;
        this.navigationPane = navigationPane;
        
        const searchBar = genTextInput();
        const searchBarContainer = <div class="wrapper">{searchBar}</div>
        this.resultContainer = <div class="wrapper results-wrapper leaflet-style hidden" />

        searchBar.addEventListener("input", async () => {
            const query = searchBar.value;
            const results = await geocoder.getSuggestionsFrom(query);
            this.updateWithResults(query, results, onClickResult);
        });

        const closestBathroomButton = new ClosestBathroomButton(
            geocoder,
            locator,
            settings,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        const closestBottleFillingButton = new ClosestBottleFillingStationButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        const closestHandSanitizerButton = new ClosestHandSanitizerStationButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();

        // Emergency
        const closestBleedingControlKitButton = new ClosestBleedingControlKitButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        const closestAedButton = new ClosestAedButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        settings.addWatcher("show-emergency", show => {
            if (show) {
                closestBleedingControlKitButton.classList.remove("hidden");
                closestAedButton.classList.remove("hidden");
            } else {
                closestBleedingControlKitButton.classList.add("hidden");
                closestAedButton.classList.add("hidden");
            }
        });

        // Infrastructure
        const closestAhuButton = new ClosestAhuButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        const closestEcButton = new ClosestEcButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        const closestBscButton = new ClosestBscButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) => this.handleClosestButtonClick(closest, starting)
        ).getHtml();
        settings.addWatcher("show-infrastructure", show => {
            if (show) {
                closestAhuButton.classList.remove("hidden");
                closestEcButton.classList.remove("hidden");
                closestBscButton.classList.remove("hidden");
            } else {
                closestAhuButton.classList.add("hidden");
                closestEcButton.classList.add("hidden");
                closestBscButton.classList.add("hidden");
            }
        });

        const categoryButtonContainer = <div class="wrapper">
            {closestBathroomButton}
            {closestBottleFillingButton}
            {closestHandSanitizerButton}
            {closestBleedingControlKitButton}
            {closestAedButton}
            {closestAhuButton}
            {closestEcButton}
            {closestBscButton}
        </div>;

        this.pane = genPaneElement("Search",
            [
                searchBarContainer,
                <h2>Find Nearest</h2>,
                categoryButtonContainer,
                this.resultContainer
            ]
        );
    }

    public getPaneId(): string {
        return "search";
    }

    public getPaneIconClass(): string {
        return "fa-search-location";
    }

    public getPaneTitle(): string {
        return "Search";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }

    private handleClosestButtonClick(closest: GeocoderDefinition, starting: BuildingLocation): void {
        const entranceLocation = new BuildingLocationWithEntrances(starting, []);
        const startingDefinition = new LocationOnlyDefinition(entranceLocation);
        this.navigationPane.navigateFrom(Some(startingDefinition), true, false);
        this.navigationPane.navigateTo(Some(closest), true, true);
        this.sidebarController.openInfo(closest);
    }

    private updateWithResults(
        query: string,
        results: GeocoderSuggestion[],
        onClickResult: (result: GeocoderSuggestion) => void
    ) {
        if (query === "") {
            this.resultContainer.classList.add("hidden");
            return;
        }

        this.resultContainer.classList.remove("hidden");

        while (this.resultContainer.firstChild !== null) {
            this.resultContainer.removeChild(this.resultContainer.firstChild);
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

            this.resultContainer.appendChild(list);
        } else {
            const container = document.createElement("li");
            container.classList.add("search-result");

            const noResults = document.createTextNode("No results");
            container.appendChild(noResults);

            list.appendChild(container);

            this.resultContainer.appendChild(list);
        }
    }
}