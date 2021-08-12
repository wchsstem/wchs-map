import {
    GridLayerOptions,
    LatLng,
    LatLngBounds,
    LeafletMouseEvent,
    Point,
} from "leaflet";
import pointInPolygon from "point-in-polygon";
import RBush, { BBox } from "rbush/rbush";

import { Logger } from "../Map/View/Sidebar/LogPane/LogPane";
import { ClickListener } from "./RoomLabel";

export interface OutlineLayerOptions extends GridLayerOptions {
    outlines: Outline[];
    maxNativeZoom: number;
    minNativeZoom: number;
    bounds: LatLngBounds;
}

export class OutlineClickHandler {
    private readonly outlines: RBush<Outline>;

    public constructor(outlines: Outline[], private readonly logger: Logger) {
        this.outlines = new RBush();
        this.outlines.load(outlines);
    }

    public clickOutline(e: LeafletMouseEvent): void {
        const clickedOutlines = this.outlines
            .search({
                maxX: e.latlng.lng + 1,
                maxY: e.latlng.lat + 1,
                minX: e.latlng.lng,
                minY: e.latlng.lat,
            })
            .filter((outline) => outline.didClick(e))
            // Assume that user intends to click on smallest target
            .sort((a, b) => a.bboxArea() - b.bboxArea());
        if (clickedOutlines.length > 0) {
            clickedOutlines[0].onClick(e);
        }
    }
}

export class Outline implements BBox {
    private readonly points: LatLng[];
    private readonly clickListeners: ClickListener[];

    public readonly maxX: number;
    public readonly maxY: number;
    public readonly minX: number;
    public readonly minY: number;

    public constructor(points: LatLng[]) {
        this.points = points;
        this.clickListeners = [];

        const [maxX, maxY, minX, minY] = points.reduce(
            ([maxX, maxY, minX, minY], point) => [
                Math.max(maxX, point.lng),
                Math.max(maxY, point.lat),
                Math.min(minX, point.lng),
                Math.min(minY, point.lat),
            ],
            [-Infinity, -Infinity, Infinity, Infinity] as [
                number,
                number,
                number,
                number,
            ],
        );
        this.maxX = maxX;
        this.maxY = maxY;
        this.minX = minX;
        this.minY = minY;
    }

    public render(
        ctx: CanvasRenderingContext2D,
        toPoint: (latLng: LatLng) => Point,
    ): void {
        const points = this.points.map((latLng) => toPoint(latLng));

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(points[0].x, points[0].y);
        ctx.fill();
    }

    public addClickListener(listener: ClickListener): void {
        this.clickListeners.push(listener);
    }

    public didClick(e: LeafletMouseEvent): boolean {
        const polygon = this.points.map((latlng) => [latlng.lng, latlng.lat]);
        return pointInPolygon([e.latlng.lng, e.latlng.lat], polygon);
    }

    public onClick(e: LeafletMouseEvent): void {
        for (const listener of this.clickListeners) {
            listener(e);
        }
    }

    public bboxArea(): number {
        return (this.maxX - this.minX) * (this.maxY - this.minY);
    }
}
