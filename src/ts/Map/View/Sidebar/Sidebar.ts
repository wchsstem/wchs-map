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

        this.addPane(navigationPane);

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

    /**
     * Register a callback for when the source and destination of the navigation are swapped
     * @param onSwap The callback
     */
    public registerOnSwapNav(onSwap: () => void): void {
        this.navigationPane.registerOnSwapNav(onSwap);
    }

    /**
     * Register a callback for when the user navigates to a definition
     * @param onNavigateTo The callback, which takes in the definition the user navigated to
     */
    public registerOnNavigateTo(onNavigateTo: (definition: Option<IGeocoderDefinition>) => void): void {
        this.navigationPane.registerOnNavigateTo(onNavigateTo);
    }

    /**
     * Register a callback for when the user navigates from a definition
     * @param onNavigateFrom The callback, which takes in the definition the user navigated from
     */
    public registerOnNavigateFrom(onNavigateFrom: (definition: Option<IGeocoderDefinition>) => void): void {
        this.navigationPane.registerOnNavigateFrom(onNavigateFrom);
    }

    /**
     * Register a callback for when the navigation pin representing the starting location is moved
     * @param onMove The callback, which takes in the current position of the pin
     */
    public registerOnMoveFromPin(onMove: (currentLocation: BuildingLocation) => void): void {
        this.navigationPane.registerOnMoveFromPin(onMove);
    }

    /**
     * Register a callback for when the navigation pin representing the destination is moved
     * @param onMove The callback, which takes in the current position of the pin
     */
    public registerOnMoveToPin(onMove: (currentLocation: BuildingLocation) => void): void {
        this.navigationPane.registerOnMoveToPin(onMove);
    }

    /**
     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
     * ie. no snapping.
     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
     */
    public setSnapPinHandler(snapPin: (location: BuildingLocation) => BuildingLocation): void {
        this.navigationPane.setSnapPinHandler(snapPin);
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
