/**
 * @jest-environment jsdom
 */

import { latLng } from "leaflet";
import { BuildingLocation } from "../ts/BuildingLocation/BuildingLocation";
import Room from "../ts/Room";

describe("Room.getName()", () => {
    test("returns room number without a specific name", () => {
        const room = new Room(
            [],
            "123",
            [],
            [],
            new BuildingLocation(latLng(0, 0), "1"),
            5,
            [],
        );
        expect(room.getName()).toBe<string>("123");
    });
});
