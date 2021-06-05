import { Control } from "leaflet";

import "./sidebar.scss";
import { Geocoder } from "../../../Geocoder/Geocoder";
import { None, Option, Some } from "@nvarner/monads";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Logger, LogPane } from "../../../LogPane/LogPane";
import { SynergyPane } from "./SynergyPane/SynergyPane";
import { Pane } from "./Pane";
import { SearchPane } from "./SearchPane/SearchPane";
import { InfoPane } from "./InfoPane";
import { SettingsPane } from "./SettingsPane/SettingsPane";
import { ISettings } from "../../../settings/ISettings";
import { IGeocoderDefinition } from "../../../Geocoder/IGeocoderDefinition";
import { BuildingLocation } from "../../../BuildingLocation/BuildingLocation";
import { GeocoderSuggestion } from "../../../Geocoder/GeocoderSuggestion";
import { LSomeLayerWithFloor } from "../../../LFloorsPlugin/LFloorsPlugin";

export class Sidebar {
    private readonly focusDefinitionHandlers: ((definition: IGeocoderDefinition) => void)[];

    private infoPane: Option<InfoPane>;

    static inject = ["map", "geocoder", "logger", "settings", "lSidebar", "navigationPane", "searchPane"] as const;
    public constructor(
        private readonly map: L.Map,
        geocoder: Geocoder,
        logger: Logger,
        settings: ISettings,
        private readonly sidebar: Control.Sidebar,
        private readonly navigationPane: NavigationPane,
        private readonly searchPane: SearchPane,
    ) {
        this.focusDefinitionHandlers = [];

        this.sidebar.addTo(this.map);

        this.infoPane = None;
        
        searchPane.registerOnClickResult(result => this.openInfoForName(geocoder, result.name));
        
        this.addPane(searchPane);
        this.navigationPane.addTo(map, this.sidebar);

        const synergyPane = new SynergyPane(geocoder, logger);

        this.addPane(new SettingsPane(settings));

        const logPane = LogPane.new();
        logger.associateWithLogPane(logPane);
        settings.addWatcher("logger", enable => {
            if (enable) {
                this.sidebar.addPanel(logPane.getPanelOptions());
            } else {
                this.sidebar.removePanel(logPane.getId());
            }
        });

        settings.addWatcher("synergy", enable => {
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
    private setUpInfoPane(definition: IGeocoderDefinition): InfoPane {
        this.infoPane.ifSome(infoPane => this.removePane(infoPane));
        const infoPane = new InfoPane(
            definition,
            this.navigationPane
        );
        this.infoPane = Some(infoPane);

        this.focusDefinitionHandlers.forEach(handler => infoPane.registerOnFocusDefinition(handler));

        return infoPane;
    }

    /**
     * Register a callback for when a search result is clicked
     * @param onClickResult The callback, which takes in the suggestion corresponding to the clicked search result
     */
    public registerOnClickSearchResult(onClickResult: (result: GeocoderSuggestion) => void): void {
        this.searchPane.registerOnClickResult(onClickResult);
    }

    /**
     * Register a callback for when a closest <something> (eg. closest bathroom) button is clicked
     * @param onClickClosest The callback, which takes in the closest definition and the definition the user is starting
     * from
     */
    public registerOnClickClosest(
        onClickClosest: (closest: IGeocoderDefinition, starting: BuildingLocation) => void
    ): void {
        this.searchPane.registerOnClickClosest(onClickClosest);
    }

    /**
     * Register a callback for when a definition is focused
     * @param onFocusDefinition The callback, which takes in the definition being focused
     */
    public registerOnFocusDefinition(onFocusDefinition: (definition: IGeocoderDefinition) => void): void {
        this.focusDefinitionHandlers.push(onFocusDefinition);
        this.infoPane.ifSome(infoPane => infoPane.registerOnFocusDefinition(onFocusDefinition));
    }

    public openInfoFor(definition: IGeocoderDefinition): void {
        const infoPane = this.setUpInfoPane(definition);

        this.addPane(infoPane);
        this.openPane(infoPane);
    }

    public openInfoForName(geocoder: Geocoder, name: string): void {
        geocoder.getDefinitionFromName(name).ifSome(location => this.openInfoFor(location));
    }
    
    public clearNav(): void {
        this.navigationPane.clearNav();
    }

    public displayNav(layers: Set<LSomeLayerWithFloor>): void {
        this.navigationPane.displayNav(layers);
    }
}
