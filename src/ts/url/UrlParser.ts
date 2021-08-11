import { LatLng } from "leaflet";

import { BuildingLocation } from "../BuildingLocation/BuildingLocation";

export function isArgumentatedUrl(url: string): boolean {
    // This regex could probably be made more efficient, but it's called once
    // eslint-disable-next-line security/detect-unsafe-regex
    const urlRegex = /^.*\/pos:\((\d+,){2}\d+\)/u;
    const matches = url.match(urlRegex);
    return matches != null;
}

export function parseUrl(url: string): BuildingLocation {
    const posStart = "pos:(";
    const startInd: number = url.lastIndexOf(posStart) + posStart.length;
    const clippedString: string = url.substring(startInd);

    const posEnd = ")";
    const endInd: number = clippedString.indexOf(posEnd);
    const dataString: string = clippedString.substring(0, endInd);

    const data: string[] = dataString.split(",");
    const x: number = +data[0];
    const y: number = +data[1];
    const floor: string = data[2];

    const latlng: LatLng = new LatLng(y, x);
    const outBuilding: BuildingLocation = new BuildingLocation(latlng, floor);
    return outBuilding;
}
