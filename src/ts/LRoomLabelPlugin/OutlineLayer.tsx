import { Coords, GridLayer, GridLayerOptions, LatLng, LeafletEventHandlerFn, Map as LMap, Point, point, PointExpression } from "leaflet";
import RBush, { BBox } from "rbush/rbush";
import { h } from "../JSX";

export class OutlineLayer extends GridLayer {
    private readonly outlines: RBush<Outline>;

    public constructor(outlines: Outline[], options?: GridLayerOptions) {
        super(options);
        this.outlines = new RBush();
        this.outlines.load(outlines);
    }

    protected createTile(coords: Coords): HTMLElement {
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

        return tile;
    }

    public getEvents(): { [name: string]: LeafletEventHandlerFn } {
        const events = super.getEvents!();
        // Prevent layers from being invalidated after panning
        delete events["viewprereset"];
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

    public readonly maxX: number;
    public readonly maxY: number;
    public readonly minX: number;
    public readonly minY: number;

    public constructor(points: LatLng[]) {
        this.points = points;

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
}