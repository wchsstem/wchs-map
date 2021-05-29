/**
 * Explicately create a tuple. Same as doing `[x, y, ...]`, but can return a tuple type instead of array.
 * @param a Elements of the tuple
 * @returns Tuple of `a`s
 */
export function t<T extends unknown[]>(...a: T): T {
    return a;
}

export class T2<A, B> {
    public readonly e0: A;
    public readonly e1: B;

    private constructor(e0: A, e1: B) {
        this.e0 = e0;
        this.e1 = e1;
    }

    public map<C, D>(map0: (e0: A) => C, map1: (e1: B) => D): T2<C, D> {
        return T2.new(map0(this.e0), map1(this.e1));
    }

    public static new<A, B>(e0: A, e1: B): T2<A, B> {
        return new T2(e0, e1);
    }

    public static from<A, B>(array: [A, B]): T2<A, B> {
        return new T2(array[0], array[1]);
    }
}
