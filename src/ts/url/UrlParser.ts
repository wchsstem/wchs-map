import { LatLng } from "leaflet";

import { BuildingLocation } from "../BuildingLocation/BuildingLocation";

//Maybe change the pos to be a constant?
export function isArgumentatedUrl(url: string): boolean {
    //This regex could probably be made more efficient, but it's called once
    // eslint-disable-next-line security/detect-unsafe-regex
    const urlRegex = /^.*\/pos:\((\d+,){2}\d+\)/u;
    const matches = url.match(urlRegex);
    return matches != null;
}

export function parseUrl(url: string): BuildingLocation {
    const startInd: number = url.lastIndexOf("pos:(");
    const clippedString: string = url.substring(startInd);

    const endInd: number = url.lastIndexOf(")");
    const dataString: string = clippedString.substring(0, endInd);

    const data: string[] = dataString.split(",");
    const x: number = +data[0];
    const y: number = +data[1];
    const floor: string = data[2];

    //While it isn't necessarily suited for this data, I think this class works
    const latlng: LatLng = new LatLng(x, y);
    const outBuilding: BuildingLocation = new BuildingLocation(latlng, floor);
    return outBuilding;
}
