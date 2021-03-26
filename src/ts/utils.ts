import { GeocoderSuggestion } from "./Geocoder";

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

export function deepCopy<T>(a: T): T {
    if (typeof a !== "object" || a === null) {
        return a;
    }

    if (Array.isArray(a)) {
        // @ts-ignore: TS can't tell that each element will be the same type, so this is okay
        return a.map(entry => deepCopy(entry));
    } else if (a !== null && a !== undefined && typeof a === "object") {
        return Object.getOwnPropertyNames(a)
            .reduce((copy, property) => {
                const descriptor = Object.getOwnPropertyDescriptor(a, property)!;
                Object.defineProperty(copy, property, descriptor);
                // @ts-ignore: TS can't tell that indexing here is okay and the types will be the same
                copy[property] = deepCopy(a[property]);
                return copy;
            }, Object.create(Object.getPrototypeOf(a)));
    } else {
        return a as T;
    }
}
