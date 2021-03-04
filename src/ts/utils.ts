import { BuildingLocationWithEntrances } from "./BuildingLocation";
import { Geocoder } from "./Geocoder";

const nonCap = ["and"];
const allCap = ["tv", "pe", "asl"];

export function shouldCapWord(word: string): boolean {
    return !nonCap.includes(word);
}

export function shouldAllCapWord(word: string): boolean {
    return allCap.includes(word);
}

export function capFirstLetter(toCap: string): string {
    if (toCap.length < 1) {
        return "";
    } else if (!shouldCapWord(toCap)) {
        return toCap;
    } else if (shouldAllCapWord(toCap)) {
        return toCap.toUpperCase();
    } else {
        return toCap.charAt(0).toUpperCase() + toCap.substring(1);
    }
}

export function titleCap(toCap: string): string {
    return toCap.split(" ")
        .map((word) => capFirstLetter(word))
        .join(" ");
}

const geocoder: Geocoder<BuildingLocationWithEntrances> = new Geocoder();
export { geocoder };
