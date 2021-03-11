declare module "rbush-knn/rbush-knn" {
    import RBush from "rbush/rbush";

    export default function knn<T>(
        tree: RBush<T>,
        x: number,
        y: number,
        k?: number | undefined,
        filterFn?: ((item: T) => boolean) | undefined,
        maxDistance?: number | undefined
    ): T[];
}
