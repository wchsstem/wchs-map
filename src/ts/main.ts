import * as mapDataJson from "../data/map_compiled.json";

import "../../node_modules/leaflet/dist/leaflet.css";
import "../assets/fontawesome/all.min.css";

import { Settings } from "./settings/Settings";
import { JsonMap, mapDataFactoryFactory } from "./MapData";
import { floorsFactoryFactory } from "./LFloorsPlugin/LFloorsPlugin";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../style.scss";
import "../../node_modules/leaflet-sidebar-v2/css/leaflet-sidebar.min.css";
import "leaflet-sidebar-v2";
import { LLocation } from "./LLocationPlugin/LLocationPlugin";
import { Logger } from "./LogPane/LogPane";
import { Geocoder } from "./Geocoder";
import { Locator } from "./Locator";
import { Sidebar } from "./Sidebar/SidebarController";
import { CRS, map as lMap } from "leaflet";
import { BOUNDS, MAX_ZOOM, MIN_ZOOM } from "./bounds";
import { goRes } from "./utils";
import { textMeasurerFactory } from "./TextMeasurer";
import { createInjector } from "@nvarner/fallible-typed-inject";
import { ATTRIBUTION } from "./config";
import { RoomLabelFactory } from "./LRoomLabelPlugin/RoomLabelFactory";
import { DeveloperModeService } from "./DeveloperModeService";

function main() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/serviceWorker.js");
    }

    const logger = new Logger();

    // Create map
    const map = lMap("map", {
        crs: CRS.Simple,
        center: BOUNDS.getCenter(),
        transform3DLimit: 2^20, // Prevents room overlay from drifting off the map in Firefox
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        maxBounds: BOUNDS.pad(0.5),
        maxBoundsViscosity: 1,
        zoomSnap: 1,
        zoomDelta: 1,
        wheelPxPerZoomLevel: 150,
        fadeAnimation: false
    });
    map.fitBounds(BOUNDS.pad(0.05));

    const injectorErr = goRes(createInjector()
        .provideValue("logger", logger)
        .provideValue("map", map)
        // mapDataJson is actually valid as JsonMap, but TS can't tell (yet?), so the unknown hack is needed
        .provideResultFactory("mapData", mapDataFactoryFactory(mapDataJson as unknown as JsonMap, BOUNDS))
        .provideResultFactory("floors", floorsFactoryFactory("1", { attribution: ATTRIBUTION }))
        .provideResultFactory("textMeasurer", textMeasurerFactory)
        .provideFactory("settings", defaultSettings)
        .provideClass("geocoder", Geocoder)
        .provideClass("locator", Locator)
        .provideClass("sidebar", Sidebar)
        .build());
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
        .map(floorData => floorData.number)
        .map(floor => injector.injectClass(RoomLabelFactory).build(floor, {
            minNativeZoom: MIN_ZOOM,
            maxNativeZoom: MAX_ZOOM,
            bounds: BOUNDS
        }))
        .forEach(layer => floors.addLayer(layer));

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
