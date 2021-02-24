export class T1<A> {
    public readonly e0: A;

    private constructor(e0: A) {
        this.e0 = e0;
    }
    public static new<A>(e0: A): T1<A> {
        return new T1(e0);
    }
    
    public static from<A>(array: [A]): T1<A> {
        return new T1(array[0]);
    }
}

export class T2<A, B> {
    public readonly e0: A;
    public readonly e1: B;

    private constructor(e0: A, e1: B) {
        this.e0 = e0;
        this.e1 = e1;
    }
    public static new<A, B>(e0: A, e1: B): T2<A, B> {
        return new T2(e0, e1);
    }

    public static from<A, B>(array: [A, B]): T2<A, B> {
        return new T2(array[0], array[1]);
    }
}
