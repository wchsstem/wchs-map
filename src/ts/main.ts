import * as L from "leaflet";
import MiniSearch from "minisearch";

import { settings, Watcher } from "./settings";

import * as mapData from "../map_compiled.json";
import MapData from "./MapData";
import LSearch, { SearchResult } from "../LSearchPlugin/LSearchPlugin";
import LFloors from "../LFloorsPlugin/LFloorsPlugin";
import Room from "./Room";

import "../../node_modules/leaflet/dist/leaflet.css";
import "../style.scss";

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

let pathLayers: Map<string, L.LayerGroup>;

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
        if (pathLayers !== undefined) {
            for (const [key, layer] of pathLayers) {
                leafletMap.removeLayer(layer);
            }
        }

        const path = map.findBastPath(from, to);
        pathLayers = map.createLayerGroupsFromPath(path);
        for (const [floor, layer] of pathLayers) {
            const floorObj = floors.getFloor(floor);
            layer.addTo(floorObj);
        }
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
const attribution = "Nathan Varner | <a href='https://www.nathanvarner.com'>https://www.nathanvarner.com</a>";
const floors = new LFloors(["2", "1"], "1", map, bounds, { "attribution": attribution });
floors.addTo(leafletMap);

// Display the dev layer when dev is enabled
const devLayer1 = map.createDevLayerGroup("1");
const devLayer2 = map.createDevLayerGroup("2");
settings.addWatcher("dev", new Watcher((dev: boolean) => {
    if (dev) {
        floors.getFloor("1").addLayer(devLayer1);
        floors.getFloor("2").addLayer(devLayer2);
        leafletMap.on("click", showClickLoc);
    } else {
        floors.getFloor("1").removeLayer(devLayer1);
        floors.getFloor("2").removeLayer(devLayer2);
        leafletMap.off("click", showClickLoc);
    }
}));
