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