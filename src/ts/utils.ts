import { Option, Some, None } from "monads";

import { BuildingLocationWithEntrances } from "./BuildingLocation";
import { Geocoder } from "./Geocoder";

export function capFirstLetter(toCap: string): string {
    if (toCap.length < 1) {
        return "";
    }
    return toCap.charAt(0).toUpperCase() + toCap.substring(1);
}

export function titleCap(toCap: string): string {
    return toCap.split(" ")
        .map((word) => capFirstLetter(word))
        .join(" ");
}

export function getOption<K, V>(from: Map<K, V>, key: K): Option<V> {
    const result = from.get(key);
    if (!result) {
        return None;
    }
    return Some(result);
}

const geocoder: Geocoder<BuildingLocationWithEntrances> = new Geocoder();
export { geocoder };
