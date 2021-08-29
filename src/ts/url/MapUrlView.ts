import { Map } from "leaflet";

import { Option } from "@nvarner/monads";

import { BuildingLocation } from "../BuildingLocation/BuildingLocation";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { NavigationPane } from "../Map/View/Sidebar/NavigationPane/NavigationPane";
import { parseUrl } from "./UrlParser";

const zoomLevel = 5;

export function setMapUrlView(
    url: string,
    map: Map,
    floors: LFloors,
    navPane: NavigationPane,
): void {
    const urlOption: Option<BuildingLocation> = parseUrl(url);
    urlOption.ifSome((loc: BuildingLocation) => {
        // Sets the view
        floors.setFloor(loc.getFloor());
        map.setView(loc.getXY(), zoomLevel);

        // Sets the pin
        navPane.moveFromPin(loc, false);
    });
}
