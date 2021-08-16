/**
 * @jest-environment jsdom
 */
import { LatLng } from "leaflet";

import { BuildingLocation } from "../../ts/BuildingLocation/BuildingLocation";
import { parseUrl } from "../../ts/url/UrlParser";

//Partial coverage: elaborate on this later
describe("parseUrl()", () => {
    test("returns basic parsed url", () => {
        const latlng: LatLng = new LatLng(20, 10);
        const trueLoc: BuildingLocation = new BuildingLocation(latlng, "2");

        const urlOption = parseUrl(
            "www.example.com/#/pos:(10,20,2)nonsense_text",
        );
        urlOption.ifSome((parsedLoc: BuildingLocation) => {
            expect(parsedLoc).toStrictEqual(trueLoc);
        });
    });
});
