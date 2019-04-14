import * as L from "leaflet";
import MiniSearch from "minisearch";

import { settings, Watcher } from "./settings";

import * as mapData from "./map.json";
import MapData from "./MapData";
import LSearch, { SearchResult } from "./LSearchPlugin";
import LRoomLabel from "./LRoomLabelPlugin/LRoomLabelPlugin";
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
    maxBounds: bounds.pad(0.5),
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

L.imageOverlay(mapData.map_image, bounds, {
    "attribution": "Nathan Varner | <a href='https://www.nathanvarner.com'>https://www.nathanvarner.com</a>"
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

// Add room number labels
// TODO: Labels are being placed on doors, place in center of rooms
const labelGroup = new LRoomLabel();
for (const room of map.getAllRooms()) {
    const vert = map.getGraph().getVertex(room.getEntrances()[0]);
    L.marker([vert.getLocation()[1], vert.getLocation()[0]], {
        "icon": L.divIcon({
            "html": `<span class="label">${room.getRoomNumber()}</span>`
        }),
        "interactive": false
    }).addTo(labelGroup);
}
labelGroup.addTo(leafletMap);

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

// const collideGroup = new LRoomLabel();
// L.marker([392.298316, 457.9401639999999], {
//     "icon": L.divIcon({
//         // "html": "<span class=\"label\">test</span>"
//         html: "test",
//         className: "room-label"
//     }),
//     "interactive": false
// }).addTo(collideGroup);
// collideGroup.addTo(leafletMap);
