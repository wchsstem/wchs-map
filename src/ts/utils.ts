import { GeocoderSuggestion } from "./Geocoder";
import { Ok, Option, Result, Some } from "@nvarner/monads";

// Tuple

/**
 * Explicitly create a tuple. Same as doing `[x, y, ...]`, but can return a tuple type instead of array.
 * @param a Elements of the tuple
 * @returns Tuple of `a`s
 */
export function t<T extends unknown[]>(...a: T): T {
    return a;
}

// Functional

/**
 * Merges two arrays into a single array of pairs. Takes the length of the shorter array and discards the elements of
 * the longer one above that length.
 * @param a First array to merge
 * @param b Second array to merge
 * @returns Array of pairs of corresponding elements of `a` and `b`
 */
 export function zip<T, U>(a: T[], b: U[]): [T, U][] {
    if (a.length > b.length) {
        return b.map((el, i) => [a[i], el]);
    } else {
        return a.map((el, i) => [el, b[i]]);
    }
}

/**
 * Merges an array into an existing array of pairs to create an array of triplets. Takes the length of the shorter array
 * and discards the elements of the longer one above that length.
 * @param a Array of pairs
 * @param b Array to merge in
 * @returns Single array of triplets
 */
export function zipInto<T, U, V>(a: [T, U][], b: V[]): [T, U, V][];

/**
 * Merges an array into an existing array of triplets to create an array of quadruplets. Takes the length of the shorter
 * array and discards the elements of the longer one above that length.
 * @param a Array of triplets
 * @param b Array to merge in
 * @returns Single array of quadruplets
 */
export function zipInto<T, U, V, W>(a: [T, U, V][], b: W[]): [T, U, V, W][];

/**
 * Merges one array into another. If you're seeing these docs, you might be using larger arrays than the types support.
 * In this case, you should extend the types to support your array length. However, the implementation is likely to work
 * anyway.
 * @param a Base array
 * @param b Array to merge into `a`
 * @returns Merged array
 */
export function zipInto(a: unknown[][], b: unknown[]): unknown[] {
    if (a.length > b.length) {
        return b.map((el, i) => [...a[i], el]);
    } else {
        return a.map((el, i) => [...el, b[i]]);
    }
}

/**
 * Flatten a list of lists into a single-depth list
 * @param a List of lists
 * @returns Flattened single-depth list
 */
export function flatten<T>(a: T[][]): T[] {
    return a.reduce((flat, el) => [...flat, ...el], []);
}

/**
 * Turn an array of `Option`s into an `Option` of an array. If any `None`s exist in the array, returns `None`.
 * Otherwise, returns `Some` of the entire array of unwrapped elements.
 */
export function extractOption<T>(a: Option<T>[]): Option<T[]> {
    return a.reduce((optAcc, optCurr) => optCurr.andThen(curr => optAcc.map(acc => {
        acc.push(curr);
        return acc;
    })), Some([] as T[]));
}

/**
 * Turn an array of `Option`s into an `Option` of an array. If any `None`s exist in the array, returns `None`.
 * Otherwise, returns `Some` of the entire array of unwrapped elements.
 */
export function extractResult<T, E>(a: Result<T, E>[]): Result<T[], E> {
    return a.reduce((optAcc, optCurr) => optCurr.andThen(curr => optAcc.map(acc => {
        acc.push(curr);
        return acc;
    })), Ok([] as T[]) as Result<T[], E>);
}

// Object

/**
 * Creates a deep copy of an object. This means that fields of the object are also recursively copied, so the result is
 * entirely independent of the original.
 * @param a Object to copy
 * @returns Copy of `a`
 */
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

// DOM

/**
 * Removes all children of an element.
 */
export function removeChildren(element: HTMLElement) {
    while (element.lastChild !== null) {
        element.removeChild(element.lastChild);
    }
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
