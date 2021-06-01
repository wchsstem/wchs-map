import { control } from "leaflet";

import { MapData } from "../MapData";

import "./sidebar.scss";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { Geocoder, GeocoderDefinition } from "../Geocoder";
import { None, Option, Some } from "@nvarner/monads";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Logger, LogPane } from "../LogPane/LogPane";
import { Locator } from "../Locator";
import { SynergyPane } from "./SynergyPane/SynergyPane";
import { Pane } from "./Pane";
import { SearchPane } from "./SearchPane/SearchPane";
import { InfoPane } from "./InfoPane";
import { SettingsPane } from "./SettingsPane/SettingsPane";
import { ISettings } from "../settings/ISettings";

export class Sidebar {
    private readonly map: L.Map;

    private readonly sidebar: L.Control.Sidebar;
    private readonly navigationPane: NavigationPane;
    private readonly floorsLayer: LFloors;

    private infoPane: Option<InfoPane>;

    static inject = ["map", "mapData", "geocoder", "locator", "logger", "settings", "floors"] as const;
    public constructor(
        map: L.Map,
        mapData: MapData,
        geocoder: Geocoder,
        locator: Locator,
        logger: Logger,
        settings: ISettings,
        floors: LFloors
    ) {
        this.map = map;

        this.sidebar = control.sidebar({
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.navigationPane = NavigationPane.new(geocoder, mapData, logger, floors, () => this.sidebar.open("nav"));
        this.floorsLayer = floors;

        this.infoPane = None;

        const searchPane = new SearchPane(
            geocoder,
            locator,
            settings,
            mapData,
            floors,
            this,
            this.navigationPane,
            result => {
                this.openInfoForName(geocoder, result.name);
            }
        );
        
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

    public openInfo(definition: GeocoderDefinition): void {
        this.infoPane.ifSome(infoPane => this.removePane(infoPane));
        const infoPane = new InfoPane(
            definition,
            this.navigationPane,
            (definition: GeocoderDefinition) => this.moveToDefinedLocation(definition)
        );
        this.addPane(infoPane);
        this.openPane(infoPane);
        this.infoPane = Some(infoPane);
    }

    public openInfoForName(geocoder: Geocoder, name: string): void {
        geocoder.getDefinitionFromName(name).ifSome(location => this.openInfo(location));
    }

    // Utils
    public moveToDefinedLocation(definition: GeocoderDefinition): void {
        const location = definition.getLocation();
        // TODO: Better option than always using zoom 3?
        this.map.setView(location.getXY(), 3);
        this.floorsLayer.setFloor(location.getFloor());
    }
}
