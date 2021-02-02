import * as mapDataJson from "../map_compiled.json";

import * as L from "leaflet";
import "../../node_modules/leaflet/dist/leaflet.css";

import { settings, Watcher } from "./settings";
import MapData from "./MapData";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../style.scss";
import { createSidebar } from "../Sidebar/SidebarController";
import LRoomLabel from "../LRoomLabelPlugin/LRoomLabelPlugin";
import "../../node_modules/leaflet-sidebar-v2/css/leaflet-sidebar.min.css";
import "leaflet-sidebar-v2";
import { GeocoderDefinition, GeocoderDefinitionSet } from "./Geocoder";
import { geocoder } from "./utils";
import { BuildingLocationWithEntrances } from "./BuildingLocation";
import { LLocation } from "../LLocationPlugin/LLocationPlugin";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceWorker.js");
}

// Churchill is 600ft long and 400ft across
const bounds = new L.LatLngBounds([0, 0], [400, 600]);

// @ts-ignore: JSON works fine here
const mapData = new MapData(mapDataJson, bounds);

// Initialize geocoder
const definitions = mapData.getAllRooms().map(room => {
    const graph = mapData.getGraph();
    const entranceLocations = room.getEntrances().map(entranceVertex => graph.getVertex(entranceVertex).getLocation());
    const location = new BuildingLocationWithEntrances(room.getCenter(), entranceLocations);
    return new GeocoderDefinition(room.getName(), room.getNames(), "", [], location);
});
const definitionSet = GeocoderDefinitionSet.fromDefinitions(definitions);
console.log(definitionSet, definitions);
geocoder.addDefinitionSet(definitionSet);

// Create map
const map = L.map("map", {
    crs: L.CRS.Simple,
    center: bounds.getCenter(),
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
    const location = new LLocation({});
    location.addTo(map);
}

// Create sidebar
createSidebar(map, mapData);

floors.addLayer(new LRoomLabel(mapData, "1"));
floors.addLayer(new LRoomLabel(mapData, "2"));

// Display dev layer and location of mouse click when dev is enabled
const devLayer1 = mapData.createDevLayerGroup("1");
const devLayer2 = mapData.createDevLayerGroup("2");

const locationPopup = L.popup();
function showClickLoc(e: L.LeafletMouseEvent): void {
    locationPopup.setLatLng(e.latlng)
        .setContent(`${e.latlng.lng}, ${e.latlng.lat}`)
        .openOn(map);
}

settings.addWatcher("dev", new Watcher((dev: boolean) => {
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
