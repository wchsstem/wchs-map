import { BuildingGeocoder, BuildingLocationWithEntrances } from "./BuildingLocation";
import { Geocoder, GeocoderSuggestion } from "./Geocoder";

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


export function updateWithResults(
    query: string,
    results: GeocoderSuggestion[],
    resultContainer: HTMLElement,
    onClickResult: (result: GeocoderSuggestion) => void
) {
    if (query === "") {
        resultContainer.classList.add("hidden");
        return;
    }

    resultContainer.classList.remove("hidden");

    while (resultContainer.firstChild !== null) {
        resultContainer.removeChild(resultContainer.firstChild);
    }

    const list = document.createElement("ul");
    if (results.length > 0) {
        for (const result of results) {
            const resultElement = document.createElement("li");
            resultElement.classList.add("search-result");
            resultElement.appendChild(document.createTextNode(result.name));
            resultElement.addEventListener("click", () => {
                onClickResult(result);
            });
            list.appendChild(resultElement);
        }

        resultContainer.appendChild(list);
    } else {
        const container = document.createElement("li");
        container.classList.add("search-result");

        const noResults = document.createTextNode("No results");
        container.appendChild(noResults);

        list.appendChild(container);

        resultContainer.appendChild(list);
    }
}

export function clearResults(resultContainer: HTMLElement): void {
    while (resultContainer.firstChild !== null) {
        resultContainer.removeChild(resultContainer.firstChild);
    }
    resultContainer.classList.add("hidden");
}

const geocoder: BuildingGeocoder = new BuildingGeocoder();
export { geocoder };
