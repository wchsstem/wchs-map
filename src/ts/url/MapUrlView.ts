import { Map } from "leaflet";

import { BuildingLocation } from "../BuildingLocation/BuildingLocation";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { isArgumentatedUrl, parseUrl } from "./UrlParser";

const zoomLevel = 5;
function setViewToBuildLoc(
    map: Map,
    floors: LFloors,
    loc: BuildingLocation,
): void {
    // Handles floor controls
    floors.setFloor(loc.getFloor());
    map.setView(loc.getXY(), zoomLevel);
}

export function setMapUrlView(map: Map, floors: LFloors, url: string): void {
    const isArgumentated: boolean = isArgumentatedUrl(url);
    if (isArgumentated) {
        const loc: BuildingLocation = parseUrl(url);
        setViewToBuildLoc(map, floors, loc);
    }
}
