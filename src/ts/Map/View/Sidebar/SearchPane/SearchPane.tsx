import { genPaneElement } from "../../../../GenHtml/GenHtml";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { GeocoderSuggestion } from "../../../../Geocoder/GeocoderSuggestion";
import { h } from "../../../../JSX";
import { LFloors } from "../../../../LFloorsPlugin/LFloorsPlugin";
import { Locator } from "../../../../Locator";
import { MapData } from "../../../../MapData";
import { Events } from "../../../../events/Events";
import { TextBox } from "../../../../html/custom/TextBox";
import { RoomSearchBox } from "../../../../html/custom/roomSearchBox/RoomSearchBox";
import { ISettings } from "../../../../settings/ISettings";
import { Pane } from "../Pane";
import { ClosestAedButton } from "./ClosestAedButton";
import { ClosestAhuButton } from "./ClosestAhuButton";
import { ClosestBathroomButton } from "./ClosestBathroomButton";
import { ClosestBleedingControlKitButton } from "./ClosestBleedingControlKitButton";
import { ClosestBottleFillingStationButton } from "./ClosestBottleFillingStationButton";
import { ClosestBscButton } from "./ClosestBscButton";
import { ClosestEcButton } from "./ClosestEcButton";
import { ClosestHandSanitizerStationButton } from "./ClosestHandSanitizerStationButton";

export class SearchPane extends Pane {
    private readonly pane: HTMLElement;
    private readonly resultContainer: HTMLElement;

    public static inject = [
        "geocoder",
        "locator",
        "settings",
        "mapData",
        "floors",
        "events",
    ] as const;
    public constructor(
        geocoder: Geocoder,
        locator: Locator,
        settings: ISettings,
        mapData: MapData,
        floorsLayer: LFloors,
        events: Events,
    ) {
        super();

        // const searchBar = (
        //     <TextBox
        //         onInput={async () => {
        //             const query = searchBar.value;
        //             const results = await geocoder.getSuggestionsFrom(query);
        //             this.updateWithResults(query, results, (result) =>
        //                 events.trigger("clickResult", result),
        //             );
        //         }}
        //     />
        // );
        // const searchBarContainer = <div class="wrapper">{searchBar}</div>;
        // const searchBarContainer = searchBar;
        this.resultContainer = (
            <div class="wrapper results-wrapper leaflet-style hidden" />
        );

        const searchBarContainer = (
            <RoomSearchBox geocoder={geocoder} events={events} />
        );

        const closestBathroomButton = new ClosestBathroomButton(
            geocoder,
            locator,
            settings,
            mapData,
            floorsLayer,
            (closest, starting) =>
                events.trigger("clickClosestButton", closest, starting),
        ).getHtml();
        const closestBottleFillingButton =
            new ClosestBottleFillingStationButton(
                geocoder,
                locator,
                mapData,
                floorsLayer,
                (closest, starting) =>
                    events.trigger("clickClosestButton", closest, starting),
            ).getHtml();
        const closestHandSanitizerButton =
            new ClosestHandSanitizerStationButton(
                geocoder,
                locator,
                mapData,
                floorsLayer,
                (closest, starting) =>
                    events.trigger("clickClosestButton", closest, starting),
            ).getHtml();

        // Emergency
        const closestBleedingControlKitButton =
            new ClosestBleedingControlKitButton(
                geocoder,
                locator,
                mapData,
                floorsLayer,
                (closest, starting) =>
                    events.trigger("clickClosestButton", closest, starting),
            ).getHtml();
        const closestAedButton = new ClosestAedButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) =>
                events.trigger("clickClosestButton", closest, starting),
        ).getHtml();
        settings.addWatcher("show-emergency", (show) => {
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
            (closest, starting) =>
                events.trigger("clickClosestButton", closest, starting),
        ).getHtml();
        const closestEcButton = new ClosestEcButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) =>
                events.trigger("clickClosestButton", closest, starting),
        ).getHtml();
        const closestBscButton = new ClosestBscButton(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (closest, starting) =>
                events.trigger("clickClosestButton", closest, starting),
        ).getHtml();
        settings.addWatcher("show-infrastructure", (show) => {
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

        const categoryButtonContainer = (
            <div class="wrapper">
                {closestBathroomButton}
                {closestBottleFillingButton}
                {closestHandSanitizerButton}
                {closestBleedingControlKitButton}
                {closestAedButton}
                {closestAhuButton}
                {closestEcButton}
                {closestBscButton}
            </div>
        );

        this.pane = genPaneElement("Search", [
            searchBarContainer,
            <h2>Find Nearest</h2>,
            categoryButtonContainer,
            this.resultContainer,
        ]);
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

    private updateWithResults(
        query: string,
        results: GeocoderSuggestion[],
        onClickResult: (result: GeocoderSuggestion) => void,
    ): void {
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
