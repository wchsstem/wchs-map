import { control, CRS, map as lMap } from "leaflet";
import "leaflet-sidebar-v2";

import { createInjector } from "@nvarner/fallible-typed-inject";

import "../../node_modules/leaflet-sidebar-v2/css/leaflet-sidebar.min.css";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../assets/fontawesome/all.min.css";
import * as mapDataJson from "../data/map_compiled.json";
import "../style.scss";
import { DeveloperModeService } from "./DeveloperModeService";
import { Geocoder } from "./Geocoder/Geocoder";
import { floorsFactoryFactory } from "./LFloorsPlugin/LFloorsPlugin";
import { LLocation } from "./LLocationPlugin/LLocationPlugin";
import { RoomLabelFactory } from "./LRoomLabelPlugin/RoomLabelFactory";
import { Locator } from "./Locator";
import { LeafletMapController } from "./Map/Controller/LeafletMapController";
import { LeafletMapModel } from "./Map/Model/LeafletMapModel";
import { LeafletMapView } from "./Map/View/LeafletMapView";
import { HelpPane } from "./Map/View/Sidebar/HelpPane";
import { Logger, LogPane } from "./Map/View/Sidebar/LogPane/LogPane";
import { NavigationPane } from "./Map/View/Sidebar/NavigationPane/NavigationPane";
import { SearchPane } from "./Map/View/Sidebar/SearchPane/SearchPane";
import { SettingsPane } from "./Map/View/Sidebar/SettingsPane/SettingsPane";
import { Sidebar } from "./Map/View/Sidebar/Sidebar";
import { SynergyPane } from "./Map/View/Sidebar/SynergyPane/SynergyPane";
import { JsonMap, mapDataFactoryFactory } from "./MapData";
import { textMeasurerFactory } from "./TextMeasurer";
import { BOUNDS, MAX_ZOOM, MIN_ZOOM } from "./bounds";
import { ATTRIBUTION } from "./config";
import { Events } from "./events/Events";
import { Settings } from "./settings/Settings";
import { goRes } from "./utils";

function main(): void {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/serviceWorker.js");
    }

    const logger = new Logger();

    // Create map
    const map = lMap("map", {
        crs: CRS.Simple,
        center: BOUNDS.getCenter(),
        transform3DLimit: 2 ^ 20, // Prevents room overlay from drifting off the map in Firefox
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        maxBounds: BOUNDS.pad(0.5),
        maxBoundsViscosity: 1,
        zoomSnap: 1,
        zoomDelta: 1,
        wheelPxPerZoomLevel: 150,
        fadeAnimation: false,
    });
    map.fitBounds(BOUNDS.pad(0.05));

    const lSidebar = control.sidebar({
        container: "sidebar",
        closeButton: true,
    });

    const injectorErr = goRes(
        createInjector()
            .provideValue("logger", logger)
            .provideValue("map", map)
            .provideValue("lSidebar", lSidebar)
            // mapDataJson is actually valid as JsonMap, but TS can't tell (yet?), so the unknown hack is needed
            .provideResultFactory(
                "mapData",
                mapDataFactoryFactory(
                    mapDataJson as unknown as JsonMap,
                    BOUNDS,
                ),
            )
            .provideResultFactory(
                "floors",
                floorsFactoryFactory("1", { attribution: ATTRIBUTION }),
            )
            .provideResultFactory("textMeasurer", textMeasurerFactory)
            .provideFactory("settings", defaultSettings)
            .provideClass("geocoder", Geocoder)
            .provideClass("locator", Locator)
            .provideClass("events", Events)
            .provideClass("navigationPane", NavigationPane)
            .provideClass("synergyPane", SynergyPane)
            .provideClass("searchPane", SearchPane)
            .provideClass("helpPane", HelpPane)
            .provideClass("settingsPane", SettingsPane)
            .provideFactory("logPane", () => {
                const logPane = LogPane.new();
                logger.associateWithLogPane(logPane);
                return logPane;
            })
            .provideClass("sidebar", Sidebar)
            .provideClass("mapView", LeafletMapView)
            .provideClass("mapModel", LeafletMapModel)
            .provideClass("mapController", LeafletMapController)
            .build(),
    );
    if (injectorErr[1] !== null) {
        logger.logError(`Error building injector: ${injectorErr[1]}`);
        // TODO: Error handling
        return;
    }
    const injector = injectorErr[0];

    const floors = injector.resolve("floors");
    floors.addTo(map);

    // Add location dot if we might be able to use it
    const locator = injector.resolve("locator");
    if (locator.getCanEverGeolocate()) {
        const location = injector.injectClass(LLocation);
        location.addTo(map);
    }

    // Create room label layers
    const mapData = injector.resolve("mapData");
    mapData
        .getAllFloors()
        .map((floorData) => floorData.number)
        .map((floor) =>
            injector.injectClass(RoomLabelFactory).build(floor, {
                minNativeZoom: MIN_ZOOM,
                maxNativeZoom: MAX_ZOOM,
                bounds: BOUNDS,
            }),
        )
        .forEach((layer) => floors.addLayer(layer));

    // Set up developer mode
    injector.injectClass(DeveloperModeService);
}

function defaultSettings(): Settings {
    const settings = new Settings("settings");
    settings.setDefault("bathroom-gender", "no-selection");
    settings.setDefault("dev", false);
    settings.setDefault("synergy", false);
    settings.setDefault("hiding-location", false);
    settings.setDefault("show-closed", false);
    settings.setDefault("show-infrastructure", false);
    settings.setDefault("show-emergency", false);
    settings.setDefault("logger", false);
    settings.setDefault("show-markers", true);
    settings.setDefault("location-permission", false);
    settings.setDefault("pd1", "");
    settings.setDefault("pd2", "");
    settings.setDefault("pd3", "");
    settings.setDefault("pd4", "");
    settings.setDefault("pd5", "");
    settings.setDefault("pd6", "");
    settings.setDefault("pd7", "");
    settings.setDefault("pd8", "");
    settings.setDefault("hr", "");
    return settings;
}

main();
