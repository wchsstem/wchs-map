import * as mapDataJson from "../data/map_compiled.json";

import "../../node_modules/leaflet/dist/leaflet.css";
import "../assets/fontawesome/all.min.css";

import { Settings } from "./settings";
import { MapData } from "./MapData";
import { LFloors, LSomeLayerWithFloor } from "./LFloorsPlugin/LFloorsPlugin";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../style.scss";
import LRoomLabel from "./LRoomLabelPlugin/LRoomLabelPlugin";
import "../../node_modules/leaflet-sidebar-v2/css/leaflet-sidebar.min.css";
import "leaflet-sidebar-v2";
import { LLocation } from "./LLocationPlugin/LLocationPlugin";
import { Logger } from "./LogPane/LogPane";
import { Geocoder } from "./Geocoder";
import { Locator } from "./Locator";
import { Sidebar } from "./Sidebar/SidebarController";
import { CRS, map as lMap, popup } from "leaflet";
import { None, Some, Option } from "@nvarner/monads";
import { BOUNDS, MAX_ZOOM, MIN_ZOOM } from "./bounds";
import { extractResult } from "./utils";

function main() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/serviceWorker.js");
    }

    const settings = defaultSettings();
    const logger = Logger.new();

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

    // @ts-ignore: JSON works fine here
    const resMapData = MapData.new(mapDataJson, BOUNDS);
    if (resMapData.isErr()) {
        logger.logError(`Error constructing MapData: ${resMapData.unwrapErr()}`);
    }
    const mapData = resMapData.unwrap();

    // Create geocoder
    const geocoder = new Geocoder();
    mapData.getAllRooms().forEach(room => geocoder.addDefinition(room));

    // Initialize locator
    const locator = new Locator(logger, settings);

    // Add location dot if we might be able to use it
    if (locator.getCanEverGeolocate()) {
        const location = new LLocation(locator, settings);
        location.addTo(map);
    }

    const attribution = "<a href='https://www.nathanvarner.com' target='_blank' rel='noopener'>© Nathan Varner</a>";
    const floors = new LFloors(mapData, "1", { attribution: attribution });
    floors.addTo(map);

    // Create sidebar
    const sidebar = new Sidebar(map, mapData, geocoder, locator, logger, settings, floors);

    // Create room label layers
    mapData
        .getAllFloors()
        .map(floorData => floorData.number)
        .map(floor => new LRoomLabel(mapData, sidebar, settings, floor, {
            minNativeZoom: MIN_ZOOM,
            maxNativeZoom: MAX_ZOOM,
            bounds: BOUNDS
        }))
        .forEach(layer => floors.addLayer(layer));

    // Lazily set up dev mode when enabled
    // Displays vertices, edges, mouse click location
    let devLayers: Option<LSomeLayerWithFloor[]> = None;

    const locationPopup = popup();
    function showClickLoc(e: L.LeafletMouseEvent): void {
        locationPopup.setLatLng(e.latlng)
            .setContent(`${e.latlng.lng}, ${e.latlng.lat}`)
            .openOn(map);
    }

    settings.addWatcher("dev", devUnknown => {
        const dev = devUnknown as boolean;

        if (dev) {
            if (devLayers.isNone()) {
                const resLayers = extractResult(mapData
                    .getAllFloors()
                    .map(floorData => floorData.number)
                    .map(floor => mapData.createDevLayerGroup(floor)));
                if (resLayers.isErr()) {
                    logger.logError(`Error in dev mode watcher constructing dev layers: ${resLayers.unwrapErr()}`);
                    return;
                } else {
                    devLayers = Some(resLayers.unwrap());
                }
            }
            devLayers.unwrap().forEach(devLayer => floors.addLayer(devLayer));
            map.on("click", showClickLoc);
        } else {
            devLayers.ifSome(layers => {
                layers.forEach(devLayer => floors.removeLayer(devLayer));
                map.off("click", showClickLoc);
            });
        }
    });
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
