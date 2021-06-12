import { Result } from "@nvarner/monads";

export interface IInjectableFactory<U, V> {
    // any shouldn't do any harm here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]): Result<U, string>;
    readonly inject: V;
}