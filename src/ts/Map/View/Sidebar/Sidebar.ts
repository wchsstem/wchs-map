import { Control } from "leaflet";

import { None, Option, Some } from "@nvarner/monads";

import { BuildingLocation } from "../../../BuildingLocation/BuildingLocation";
import { Geocoder } from "../../../Geocoder/Geocoder";
import { GeocoderDefinition } from "../../../Geocoder/GeocoderDefinition";
import { LSomeLayerWithFloor } from "../../../LFloorsPlugin/LFloorsPlugin";
import { Logger, LogPane } from "../../../LogPane/LogPane";
import { Events } from "../../../events/Events";
import { ISettings } from "../../../settings/ISettings";
import { InfoPane } from "./InfoPane";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Pane } from "./Pane";
import { SearchPane } from "./SearchPane/SearchPane";
import { SettingsPane } from "./SettingsPane/SettingsPane";
import { SynergyPane } from "./SynergyPane/SynergyPane";
import "./sidebar.scss";

export class Sidebar {
    private infoPane: Option<InfoPane>;

    static inject = [
        "map",
        "geocoder",
        "logger",
        "settings",
        "lSidebar",
        "navigationPane",
        "searchPane",
        "events",
    ] as const;
    public constructor(
        private readonly map: L.Map,
        geocoder: Geocoder,
        logger: Logger,
        settings: ISettings,
        private readonly sidebar: Control.Sidebar,
        private readonly navigationPane: NavigationPane,
        private readonly searchPane: SearchPane,
        private readonly events: Events,
    ) {
        this.sidebar.addTo(this.map);

        this.infoPane = None;

        this.addPane(searchPane);

        this.addPane(navigationPane);

        const synergyPane = new SynergyPane(geocoder, logger);

        this.addPane(new SettingsPane(settings));

        const logPane = LogPane.new();
        logger.associateWithLogPane(logPane);
        settings.addWatcher("logger", (enable) => {
            if (enable) {
                this.sidebar.addPanel(logPane.getPanelOptions());
            } else {
                this.sidebar.removePanel(logPane.getId());
            }
        });

        settings.addWatcher("synergy", (enable) => {
            if (enable) {
                this.addPane(synergyPane);
            } else {
                this.removePane(synergyPane);
            }
        });
    }

    protected addPane(pane: Pane): void {
        this.sidebar.addPanel(pane.getPanelOptions());
    }

    protected removePane(pane: Pane): void {
        this.sidebar.removePanel(pane.getPaneId());
    }

    protected openPane(pane: Pane): void {
        this.sidebar.open(pane.getPaneId());
    }

    /**
     * Remove the old info pane if it exists, create an info pane, set the `infoPane` property, and return the unwrapped
     * pane
     * @param definition Definition to create an info pane for
     * @returns New info pane
     */
    private setUpInfoPane(definition: GeocoderDefinition): InfoPane {
        this.infoPane.ifSome((infoPane) => this.removePane(infoPane));
        const infoPane = new InfoPane(
            definition,
            this.navigationPane,
            this.events,
        );
        this.infoPane = Some(infoPane);

        return infoPane;
    }

    /** Remove search suggestions from typing in the navigate from or to fields */
    public clearNavSuggestions(): void {
        this.navigationPane.clearNavSuggestions();
    }

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    public setSnapPinHandler(
        snapPin: (location: BuildingLocation) => BuildingLocation,
    ): void {
        this.navigationPane.setSnapPinHandler(snapPin);
    }

    public openInfoFor(definition: GeocoderDefinition): void {
        const infoPane = this.setUpInfoPane(definition);

        this.addPane(infoPane);
        this.openPane(infoPane);
    }

    public openInfoForName(geocoder: Geocoder, name: string): void {
        geocoder
            .getDefinitionFromName(name)
            .ifSome((location) => this.openInfoFor(location));
    }

    public clearNav(): void {
        this.navigationPane.clearNav();
    }

    public displayNav(layers: Set<LSomeLayerWithFloor>): void {
        this.navigationPane.displayNav(layers);
    }

    public moveFromPin(location: BuildingLocation): void {
        this.navigationPane.moveFromPin(location);
    }

    public moveToPin(location: BuildingLocation): void {
        this.navigationPane.moveToPin(location);
    }

    public setNavigateFromInputContents(contents: string): void {
        this.navigationPane.setNavigateFromInputContents(contents);
    }

    public setNavigateToInputContents(contents: string): void {
        this.navigationPane.setNavigateToInputContents(contents);
    }
}
