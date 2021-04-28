import { control } from "leaflet";

import { RoomSearch } from "./RoomSearch";
import { genPaneElement, genTextInput } from "../GenHtml/GenHtml";
import MapData from "../MapData";

import "./sidebar.scss";
import Room from "../Room";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { DROPDOWN_DATA, NAME_MAPPING, SETTING_SECTIONS, SETTING_INPUT_TYPE, settings, Watcher } from "../settings";
import { Geocoder, GeocoderDefinition } from "../Geocoder";
import { fromMap, None, Option, Some } from "@nvarner/monads";
import { T2 } from "../Tuple";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Logger, LogPane } from "../LogPane/LogPane";
import { Locator } from "../Locator";
import { SynergyPane } from "./SynergyPane/SynergyPane";
import { Pane } from "./Pane";
import { SearchPane } from "./SearchPane/SearchPane";
import { InfoPane } from "./InfoPane";
import { SettingsPane } from "./SettingsPane/SettingsPane";

export class Sidebar {
    private readonly map: L.Map;
    private readonly geocoder: Geocoder;
    private readonly mapData: MapData;
    private readonly locator: Locator;

    private readonly sidebar: L.Control.Sidebar;
    private readonly navigationPane: NavigationPane;
    private readonly floorsLayer: LFloors;

    private readonly logger: Logger;

    private infoPane: Option<InfoPane>;

    constructor(map: L.Map, mapData: MapData, geocoder: Geocoder, locator: Locator, logger: Logger, floorsLayer: LFloors) {
        this.map = map;
        this.sidebar = control.sidebar({
            container: "sidebar",
            closeButton: true
        });
        this.sidebar.addTo(this.map);

        this.geocoder = geocoder;
        this.mapData = mapData;
        this.locator = locator;
        this.logger = logger;
        this.floorsLayer = floorsLayer;

        this.navigationPane = NavigationPane.new(geocoder, mapData, floorsLayer, () => this.sidebar.open("nav"));
        this.infoPane = None;

        const searchPane = new SearchPane(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            this,
            this.navigationPane,
            result => {
                this.openInfoForName(geocoder, result.name);
            }
        );
        
        this.addPane(searchPane);
        this.navigationPane.addTo(map, this.sidebar);

        const synergyPane = new SynergyPane(geocoder, logger);

        this.addPane(new SettingsPane());

        const logPane = LogPane.new();
        logger.associateWithLogPane(logPane);
        settings.addWatcher("logger", new Watcher(enable => {
            if (enable) {
                this.sidebar.addPanel(logPane.getPanelOptions());
            } else {
                this.sidebar.removePanel(logPane.getId());
            }
        }));

        settings.addWatcher("synergy", new Watcher((enable) => {
            if (enable) {
                this.addPane(synergyPane);
            } else {
                this.removePane(synergyPane);
            }
        }));
    }

    protected addPane(pane: Pane) {
        this.sidebar.addPanel(pane.getPanelOptions());
    }

    protected removePane(pane: Pane) {
        this.sidebar.removePanel(pane.getPaneId());
    }

    protected openPane(pane: Pane) {
        this.sidebar.open(pane.getPaneId());
    }

    public openInfo(definition: GeocoderDefinition) {
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

    public openInfoForName(geocoder: Geocoder, name: string) {
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
