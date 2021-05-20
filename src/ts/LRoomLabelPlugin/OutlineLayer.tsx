import { Coords, GridLayer, GridLayerOptions, LatLng, LatLngBounds, LeafletEventHandlerFn, LeafletMouseEvent, Point, point } from "leaflet";
import RBush, { BBox } from "rbush/rbush";
import { h } from "../JSX";
import { ClickListener } from "./LRoomLabelPlugin";
import pointInPolygon from "point-in-polygon";

export interface OutlineLayerOptions extends GridLayerOptions {
    outlines: Outline[],
    maxNativeZoom: number,
    minNativeZoom: number,
    bounds: LatLngBounds
}

export class OutlineLayer extends GridLayer {
    private readonly outlines: RBush<Outline>;
    private readonly tileCache: Map<string, HTMLElement>;

    public constructor(options: OutlineLayerOptions) {
        super(options);
        this.outlines = new RBush();
        this.outlines.load(options.outlines);
        this.tileCache = new Map();
    }

    protected createTile(coords: Coords): HTMLElement {
        const cachedTile = this.tileCache.get(JSON.stringify(coords));
        if (cachedTile !== undefined) {
            return cachedTile;
        }

        const tileSize = this.getTileSize();

        const tile = <canvas width={tileSize.x} height={tileSize.y} /> as HTMLCanvasElement;
        const ctx = tile.getContext("2d")!;
        ctx.fillStyle = "rgba(125, 181, 52, 0.2)";

        const tileTopLeftPoint = coords.scaleBy(tileSize);
        const tileBBox = this.tileBBox(coords, tileSize);

        tile.setAttribute("data-bbox", JSON.stringify(tileBBox));

        const renderableOutlines = this.outlines.search(tileBBox);
        for (const outline of renderableOutlines) {
            outline.render(ctx, latLng => this._map.project(latLng, coords.z).subtract(tileTopLeftPoint));
        }

        this.tileCache.set(JSON.stringify(coords), tile);
        return tile;
    }

    public getEvents(): { [name: string]: LeafletEventHandlerFn } {
        const events = super.getEvents!();
        // Prevent layers from being invalidated after panning
        delete events["viewprereset"];
        events["click"] = e => {
            const me = e as LeafletMouseEvent;
            const clickedOutlines = this.outlines.search({
                maxX: me.latlng.lng + 1,
                maxY: me.latlng.lat + 1,
                minX: me.latlng.lng,
                minY: me.latlng.lat
            }).filter(outline => outline.didClick(me));
            if (clickedOutlines.length > 0) {
                clickedOutlines[0].onClick(me);
            }
        };
        return events;
    }

    private tileBBox(coords: Coords, tileSize: Point): BBox {
        const tileTopLeftPoint = coords.scaleBy(tileSize);
        const tileTopLeft = this._map.unproject(tileTopLeftPoint, coords.z);

        const tileBottomRightPoint = coords.add(point(1, 1)).scaleBy(tileSize);
        const tileBottomRight = this._map.unproject(tileBottomRightPoint, coords.z);

        return {
            maxX: tileBottomRight.lng,
            maxY: tileTopLeft.lat,
            minX: tileTopLeft.lng,
            minY: tileBottomRight.lat
        };
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
                Math.max(maxX, point.lng), Math.max(maxY, point.lat),
                Math.min(minX, point.lng), Math.min(minY, point.lat)
            ],
            [-Infinity, -Infinity, Infinity, Infinity] as [number, number, number, number]
        );
        this.maxX = maxX;
        this.maxY = maxY;
        this.minX = minX;
        this.minY = minY;
    }

    public render(ctx: CanvasRenderingContext2D, toPoint: (latLng: LatLng) => Point): void {
        const points = this.points.map(latLng => toPoint(latLng));

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
        const polygon = this.points.map(latlng => [latlng.lng, latlng.lat]);
        return pointInPolygon([e.latlng.lng, e.latlng.lat], polygon);
    }

    public onClick(e: LeafletMouseEvent): void {
        for (const listener of this.clickListeners) {
            listener(e);
        }
    }
}
