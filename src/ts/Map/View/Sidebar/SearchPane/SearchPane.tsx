import { genPaneElement } from "../../../../GenHtml/GenHtml";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { GeocoderSuggestion } from "../../../../Geocoder/GeocoderSuggestion";
import { h } from "../../../../JSX";
import { LFloors } from "../../../../LFloorsPlugin/LFloorsPlugin";
import { Locator } from "../../../../Locator";
import { MapData } from "../../../../MapData";
import { Events } from "../../../../events/Events";
import { FaIcon } from "../../../../html/custom/FaIcon";
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
            <div className="wrapper">
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
            <RoomSearchBox
                resultIcon={<FaIcon faClass="search" />}
                geocoder={geocoder}
                onChooseResult={(result: GeocoderSuggestion) =>
                    events.trigger("clickResult", result)
                }
            />,
            <h2>Find Nearest</h2>,
            categoryButtonContainer,
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
}
