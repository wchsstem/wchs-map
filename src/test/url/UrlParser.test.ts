import { isArgumentatedUrl } from "../../ts/url/UrlParser";

describe("isArgumentatedUrl()", () => {
    test("returns url that has no arguments or marker", () => {
        const isArg: boolean = isArgumentatedUrl("www.example.com/#/");
        expect(isArg).toBe<boolean>(false);
    });

    test("returns url that has marker but no arguments", () => {
        const isArg: boolean = isArgumentatedUrl("www.example.com/#/pos:");
        expect(isArg).toBe<boolean>(false);
    });

    test("returns url that has arguments but no marker", () => {
        const isArg: boolean = isArgumentatedUrl("www.example.com/#/10,20,30");
        expect(isArg).toBe<boolean>(false);
    });

    test("returns url that has 2 arguments (too few)", () => {
        const isArg: boolean = isArgumentatedUrl("www.example.com/#/pos:10,20");
        expect(isArg).toBe<boolean>(false);
    });

    test("returns url that has full arguments", () => {
        const isArg: boolean = isArgumentatedUrl(
            "www.example.com/#/pos:10,20,2",
        );
        expect(isArg).toBe<boolean>(true);
    });

    test("returns url with text based arguments", () => {
        const isArg: boolean = isArgumentatedUrl(
            "www.example.com/#/pos:ten,twenty,two",
        );
        expect(isArg).toBe<boolean>(false);
    });
});
