import { MapUrlPos } from "../../ts/url/MapUrlPos";

describe("MapUrlPos.constructor()", () => {
    test("returns mapPos with no values", () => {
        const mapPos: MapUrlPos = new MapUrlPos(100, 100, 1);

        expect(mapPos.floorNum).toBe<number>(1);
    });

    test("returns mapPos with negative xCoord", () => {
        expect(() => {
            new MapUrlPos(-10, 100, 1);
        }).toThrow("Coordinate value cannot be negative");
    });

    test("returns mapPos with negative yCoord", () => {
        expect(() => {
            new MapUrlPos(100, -10, 1);
        }).toThrow("Coordinate value cannot be negative");
    });

    test("returns mapPos with negative floor", () => {
        expect(() => {
            new MapUrlPos(100, 100, -1);
        }).toThrow("Floor number cannot be negative");
    });

    test("returns mapPos with decimal floor location", () => {
        expect(() => {
            new MapUrlPos(100, 100, 1.5);
        }).toThrow("Floor number cannot be a decimal");
    });
});
