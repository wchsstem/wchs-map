import * as mapDataJson from "../data/map_compiled.json";

import "../../node_modules/leaflet/dist/leaflet.css";
import "../assets/fontawesome/all.min.css";

import { settings, Watcher } from "./settings";
import MapData from "./MapData";
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

function main() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/serviceWorker.js");
    }

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
    const mapData = new MapData(mapDataJson, BOUNDS);

    // Create geocoder
    const geocoder = new Geocoder();
    mapData.getAllRooms().forEach(room => geocoder.addDefinition(room));

    // Initialize locator
    const locator = new Locator(logger);

    // Add location dot if we might be able to use it
    if (locator.getCanEverGeolocate()) {
        const location = new LLocation(locator);
        location.addTo(map);
    }

    const attribution = "<a href='https://www.nathanvarner.com' target='_blank' rel='noopener'>© Nathan Varner</a>";
    const floors = new LFloors(mapData, "1", { attribution: attribution });
    floors.addTo(map);

    // Create sidebar
    const sidebar = new Sidebar(map, mapData, geocoder, locator, logger, floors);

    // Create room label layers
    mapData
        .getFloors()
        .map(floorData => floorData.number)
        .map(floor => new LRoomLabel(mapData, sidebar, floor, {
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

    settings.addWatcher("dev", new Watcher(devUnknown => {
        const dev = devUnknown as boolean;

        if (dev) {
            if (devLayers.isNone()) {
                const layers = mapData
                    .getFloors()
                    .map(floorData => floorData.number)
                    .map(floor => mapData.createDevLayerGroup(floor));
                devLayers = Some(layers);
            }
            devLayers.unwrap().forEach(devLayer => floors.addLayer(devLayer));
            map.on("click", showClickLoc);
        } else {
            devLayers.ifSome(layers => {
                layers.forEach(devLayer => floors.removeLayer(devLayer));
                map.off("click", showClickLoc);
            });
        }
    }));
}

main();
