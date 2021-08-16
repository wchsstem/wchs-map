import { LatLng } from "leaflet";

import { None, Option, Some } from "@nvarner/monads";
import { BuildingLocation } from "../BuildingLocation/BuildingLocation";



export function parseUrl(url: string): Option<BuildingLocation> {
	const urlRegex = /pos:\((\d+),(\d+),(\d+)\)/u;

	const matches = url.match(urlRegex);
	if(!matches || matches.length < 4) return None;

	const x: number = +matches[1];
    const y: number = +matches[2];
    const floor: string = matches[3];

    const latlng: LatLng = new LatLng(y, x);
    const outBuilding: BuildingLocation = new BuildingLocation(latlng, floor);
	
    return Some(outBuilding);
}
