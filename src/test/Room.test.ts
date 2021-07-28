/**
 * @jest-environment jsdom
 */
import { latLng } from "leaflet";

import { BuildingLocation } from "../ts/BuildingLocation/BuildingLocation";
import { DefinitionTag } from "../ts/Geocoder/DefinitionTag";
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

    test("returns only name with room number when one is available", () => {
        const room = new Room(
            [],
            "123",
            ["Cafeteria"],
            [],
            new BuildingLocation(latLng(0, 0), "1"),
            5,
            [],
        );
        expect(room.getName()).toBe<string>("Cafeteria (123)");
    });
});

describe("Room.hasTag()", () => {
    test("returns true when tag is present", () => {
        const room = new Room(
            [],
            "123",
            [],
            [],
            new BuildingLocation(latLng(0, 0), "1"),
            5,
            [DefinitionTag.EC],
        );
        expect(room.hasTag(DefinitionTag.EC)).toBe<boolean>(true);
    });
});
