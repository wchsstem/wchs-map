import { Map } from "leaflet";

import { BuildingLocation } from "../BuildingLocation/BuildingLocation";
import { isArgumentatedUrl, parseUrl } from "./UrlParser";

const zoomLevel = 5;
function setViewToBuildLoc(map: Map, loc: BuildingLocation): void {
    console.log(loc.getXY());
    map.setView(loc.getXY(), zoomLevel);
}

export function setMapUrlView(map: Map, url: string): void {
    console.log(url);
    const isArgumentated: boolean = isArgumentatedUrl(url);
    console.log(isArgumentated);
    if (isArgumentated) {
        const loc: BuildingLocation = parseUrl(url);
        console.log(loc);
        setViewToBuildLoc(map, loc);
    }
}
