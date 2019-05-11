import * as L from "leaflet";
import MiniSearch from "minisearch";

import { settings, Watcher } from "./settings";

import * as mapData from "../dist/map.json";
import MapData from "./MapData";
import LSearch, { SearchResult } from "./LSearchPlugin";
import LRoomLabel from "./LRoomLabelPlugin/LRoomLabelPlugin";
import LFloors from "./LFloorsPlugin/LFloorsPlugin";
import Room from "./Room";

import "../node_modules/leaflet/dist/leaflet.css";
import "./lsearch.scss";
import "./style.scss";

// Setup map
// Churchill is 600ft long and 400ft across
const bounds = new L.LatLngBounds([0, 0], [400, 600]);
const leafletMap = L.map("map", {
    crs: L.CRS.Simple,
    center: bounds.getCenter(),
    maxZoom: 3,
    minZoom: 0,
    // maxBounds: bounds.pad(0.5),
    maxBounds: bounds.pad(1),
    maxBoundsViscosity: 1
});

let pathLayer: L.LayerGroup;

const search = LSearch.lSearch(
    (query: string): SearchResult[] => {
        const minisearch = new MiniSearch({
            "fields": ["namesAsString", "roomNumber"],
            "searchOptions": {
                "prefix": true,
                "fuzzy": 0.175
            },
            "idField": "roomNumber"
        });
        minisearch.addAll(map.getAllRooms());

        const results = minisearch.search(query).map((result: {
            "id": string
        }) => {
            return new SearchResult(map.getRoom(result.id));
        });
        
        return results;
    },
    (choice: SearchResult): void => {
        alert(choice.getRoomNumber());
    },
    (from: Room, to: Room): void => {
        if (pathLayer !== undefined) {
            leafletMap.removeLayer(pathLayer);
        }

        const path = map.findBastPath(from, to);
        pathLayer = map.createLayerGroupFromPath(path);
        pathLayer.addTo(leafletMap);
    }).addTo(leafletMap);

leafletMap.fitBounds(bounds);

const popup = L.popup();
function showClickLoc(e: L.LocationEvent) {
    popup
        .setLatLng(e.latlng)
        .setContent(`${e.latlng.lng}, ${e.latlng.lat}`)
        .openOn(leafletMap);
}

// @ts-ignore: How bad can it be?
const map = new MapData(mapData);

console.log(mapData);
const firstFloorMap = L.imageOverlay(mapData.map_image, bounds, {
    "attribution": "Nathan Varner | <a href='https://www.nathanvarner.com'>https://www.nathanvarner.com</a>"
});
const firstFloorLabelGroup = new LRoomLabel();
for (const room of map.getAllRooms()) {
    const location = room.getCenter() ? room.getCenter() :
        map.getGraph().getVertex(room.getEntrances()[0]).getLocation();
    L.marker([location[1], location[0]], {
        "icon": L.divIcon({
            "html": room.getRoomNumber(),
            className: "room-label"
        }),
        "interactive": false
    }).addTo(firstFloorLabelGroup);
}
const firstFloor = L.layerGroup([firstFloorMap, firstFloorLabelGroup]);

const secondFloorMap = L.imageOverlay("http://127.0.0.1/churchill-map/2nd_floor.svg", bounds);

const floorsMap = new Map();
floorsMap.set("2", secondFloorMap);
floorsMap.set("1", firstFloor);

const floors = new LFloors(floorsMap, "1");
floors.addTo(leafletMap);

const devLayer = map.createDevLayerGroup();

// Display the dev layer when dev is enabled
settings.addWatcher("dev", new Watcher((dev: boolean) => {
    if (dev) {
        leafletMap.addLayer(devLayer);
        leafletMap.on("click", showClickLoc);
    } else {
        leafletMap.removeLayer(devLayer);
        leafletMap.off("click", showClickLoc);
    }
}));
