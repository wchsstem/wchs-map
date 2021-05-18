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
import { CRS, LatLngBounds, map as lMap, popup } from "leaflet";
import { None, Some, Option } from "@nvarner/monads";

function main() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/serviceWorker.js");
    }

    const logger = Logger.new();

    // Churchill is 600ft long and 400ft across; portables add to that

    // bounds used to just be defined in terms of constants, but due to mistakes made when choosing those constants and
    // the subsequent addition of the portables, this was used instead. It should be easier to configure for existing maps,
    // but new maps should instead carefully choose a coordinate system such that the bounds fit the aspect ratio of the
    // base map image to avoid having to do this.
    const width = 161.31325; // width of 1st floor from Inkscape; arbitrary unit
    const height = 123.15513; // width of 2nd floor from Inkscape; same unit as width
    const scale = 3.78;
    const pushX = 5;
    const bounds = new LatLngBounds([0, pushX], [scale * height, (scale * width) + pushX]);

    // Create map
    const map = lMap("map", {
        crs: CRS.Simple,
        center: bounds.getCenter(),
        transform3DLimit: 2^20, // Prevents room overlay from drifting off the map in Firefox
        maxZoom: 3,
        minZoom: -1,
        maxBounds: bounds.pad(0.5),
        maxBoundsViscosity: 1,
        zoomSnap: 1,
        zoomDelta: 0.4,
        wheelPxPerZoomLevel: 150,
        fadeAnimation: false
    });
    map.fitBounds(bounds.pad(0.05));

    // @ts-ignore: JSON works fine here
    const mapData = new MapData(mapDataJson, bounds);

    // Create geocoder
    const geocoder = new Geocoder();
    (async () => {
        // Initialize geocoder with definitions
        for (const room of mapData.getAllRooms()) {
            geocoder.addDefinition(room);
        }
    })();

    // Initialize locator
    const locator = new Locator(logger);

    // Add location dot if we might be able to use it
    if (locator.getCanEverGeolocate()) {
        const location = new LLocation(locator);
        location.addTo(map);
    }

    const attribution = "<a href='https://www.nathanvarner.com' target='_blank'>© Nathan Varner</a>";
    const floors = new LFloors(mapData, "1", { attribution: attribution });
    floors.addTo(map);

    // Create sidebar
    const sidebar = new Sidebar(map, mapData, geocoder, locator, logger, floors);

    floors.addLayer(new LRoomLabel(mapData, sidebar, "1"));
    floors.addLayer(new LRoomLabel(mapData, sidebar, "2"));

    // Display vertices, edges, mouse click location
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
