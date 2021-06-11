import { latLng, LatLng, LatLngBounds, latLngBounds, LatLngBoundsExpression } from "leaflet";

/** Represents a rectangular area on one floor */
export class BuildingLocationBBox {
    public constructor(
        private readonly bottomLeft: LatLng,
        private readonly topRight: LatLng,
        private readonly floor: string
    ) {}

    public static fromPoints(points: LatLng[], floor: string): BuildingLocationBBox {
        const xs = points.map(point => point.lng);
        const maxX = Math.max(...xs);
        const minX = Math.min(...xs);

        const ys = points.map(point => point.lat);
        const maxY = Math.max(...ys);
        const minY = Math.min(...ys);

        const bottomLeft = latLng(minX, minY);
        const topRight = latLng(maxX, maxY);

        return new BuildingLocationBBox(bottomLeft, topRight, floor);
    }

    public getBottomLeft(): LatLng {
        return this.bottomLeft;
    }

    public getTopRight(): LatLng {
        return this.topRight;
    }

    public getFloor(): string {
        return this.floor;
    }

    public toLatLngBounds(): LatLngBounds {
        return latLngBounds(this.bottomLeft, this.topRight);
    }
}