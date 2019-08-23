import * as L from "leaflet";

import { settings, Watcher } from "./settings";
import * as mapData from "../map_compiled.json";
import MapData from "./MapData";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../style.scss";
import { SidebarController } from "../Sidebar/SidebarController";
import LRoomLabel from "../LRoomLabelPlugin/LRoomLabelPlugin";

// Setup map
// Churchill is 600ft long and 400ft across
const bounds = new L.LatLngBounds([0, 0], [400, 600]);

const leafletMap = L.map("map", {
    crs: L.CRS.Simple,
    center: bounds.getCenter(),
    maxZoom: 3,
    minZoom: 0,
    maxBounds: bounds.pad(0.5),
    maxBoundsViscosity: 1
});

leafletMap.fitBounds(bounds);

// @ts-ignore: JSON works fine here
const map = new MapData(mapData);

const attribution = "Nathan Varner | <a href='https://www.nathanvarner.com'>https://www.nathanvarner.com</a>";
const floors = new LFloors(["2", "1"], "1", map, bounds, { "attribution": attribution });
floors.addTo(leafletMap);

const sidebarEl = document.getElementById("sidebar");
const sidebarController = new SidebarController(sidebarEl, map, floors, leafletMap);

floors.addLayer(new LRoomLabel(map, "1", sidebarController));
floors.addLayer(new LRoomLabel(map, "2", sidebarController));

// Display dev layer, mouse click location when dev is enabled
const devLayer1 = map.createDevLayerGroup("1");
const devLayer2 = map.createDevLayerGroup("2");

const locationPopup = L.popup();
function showClickLoc(e: L.LocationEvent) {
    locationPopup.setLatLng(e.latlng)
        .setContent(`${e.latlng.lng}, ${e.latlng.lat}`)
        .openOn(leafletMap);
}

settings.addWatcher("dev", new Watcher((dev: boolean) => {
    if (dev) {
        floors.addLayer(devLayer1);
        floors.addLayer(devLayer2);
        leafletMap.on("click", showClickLoc);
    } else {
        floors.removeLayer(devLayer1);
        floors.removeLayer(devLayer2);
        leafletMap.off("click", showClickLoc);
    }
}));
