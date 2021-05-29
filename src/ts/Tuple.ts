/**
 * Explicately create a tuple. Same as doing `[x, y, ...]`, but can return a tuple type instead of array.
 * @param a Elements of the tuple
 * @returns Tuple of `a`s
 */
export function t<T extends unknown[]>(...a: T): T {
    return a;
}
