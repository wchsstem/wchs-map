import * as mapDataJson from "../map_compiled.json";

import * as L from "leaflet";
import "../../node_modules/leaflet/dist/leaflet.css";

import "../assets/fontawesome/all.min.css";

import { settings, Watcher } from "./settings";
import MapData from "./MapData";
import { LFloors } from "./LFloorsPlugin/LFloorsPlugin";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../style.scss";
import { createSidebar } from "./Sidebar/SidebarController";
import LRoomLabel from "./LRoomLabelPlugin/LRoomLabelPlugin";
import "../../node_modules/leaflet-sidebar-v2/css/leaflet-sidebar.min.css";
import "leaflet-sidebar-v2";
import { BuildingGeocoder, BuildingLocationWithEntrances } from "./BuildingLocation";
import { LLocation } from "./LLocationPlugin/LLocationPlugin";
import { Logger } from "./LogPane/LogPane";

export declare namespace JSX {
    interface Element { }
    interface IntrinsicElements { div: any; }
}

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
    const bounds = new L.LatLngBounds([0, pushX], [scale * height, (scale * width) + pushX]);

    // @ts-ignore: JSON works fine here
    const mapData = new MapData(mapDataJson, bounds);

    // Initialize geocoder
    const geocoder: BuildingGeocoder = new BuildingGeocoder();
    for (const room of mapData.getAllRooms()) {
        geocoder.addDefinition(room);
    }

    // Create map
    const map = L.map("map", {
        crs: L.CRS.Simple,
        center: bounds.getCenter(),
        transform3DLimit: 2^20, // Prevents room overlay from drifting off the map in Firefox
        maxZoom: 3,
        minZoom: -1,
        maxBounds: bounds.pad(0.5),
        maxBoundsViscosity: 1,
        zoomSnap: 0,
        zoomDelta: 0.4,
        wheelPxPerZoomLevel: 75
    });

    map.fitBounds(bounds.pad(0.05));

    const attribution = "<a href='https://www.nathanvarner.com' target='_blank'>© Nathan Varner</a>";
    const floors = new LFloors(mapData, "1", { "attribution": attribution });
    floors.addTo(map);

    if ("geolocation" in navigator) {
        const location = new LLocation(logger, {});
        location.addTo(map);
    }

    // Create sidebar
    createSidebar(map, mapData, geocoder, logger);

    floors.addLayer(new LRoomLabel(mapData, geocoder, "1"));
    floors.addLayer(new LRoomLabel(mapData, geocoder, "2"));

    // Display dev layer and location of mouse click when dev is enabled
    const devLayer1 = mapData.createDevLayerGroup("1");
    const devLayer2 = mapData.createDevLayerGroup("2");

    const locationPopup = L.popup();
    function showClickLoc(e: L.LeafletMouseEvent): void {
        locationPopup.setLatLng(e.latlng)
            .setContent(`${e.latlng.lng}, ${e.latlng.lat}`)
            .openOn(map);
    }

    settings.addWatcher("dev", new Watcher((devUnknown) => {
        const dev = devUnknown as boolean;
        if (dev) {
            floors.addLayer(devLayer1);
            floors.addLayer(devLayer2);
            map.on("click", showClickLoc);
        } else {
            floors.removeLayer(devLayer1);
            floors.removeLayer(devLayer2);
            map.off("click", showClickLoc);
        }
    }));
}

main();
