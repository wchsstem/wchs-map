import { Coords, GridLayer, GridLayerOptions, LatLng, LeafletEventHandlerFn, Marker, Point, point, PointExpression } from "leaflet";
import RBush, { BBox } from "rbush/rbush";
import { h } from "../JSX";

/**
 * RBush entry representing the LatLang bounding box around a Marker
 */
type RBushEntry = {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    label: Marker
}

export class LabelLayer extends GridLayer {
    private readonly labels: RBush<RBushEntry>;
    private readonly labelsArray: Marker[];

    private readonly visibleLabels: RBush<RBushEntry>;
    private readonly visibleLabelsSet: Set<Marker>;
    private visibleLabelsZoomLevel: number;

    public constructor(labels: Marker[], options?: GridLayerOptions) {
        super(options);

        this.labels = new RBush();
        this.labelsArray = labels;

        this.visibleLabels = new RBush();
        this.visibleLabelsSet = new Set();
        this.visibleLabelsZoomLevel = Infinity;
    }

    protected createTile(coords: Coords): HTMLElement {
        this.reloadVisibleLabelsIfZoomChanged();

        const tileSize = this.getTileSize();

        const tile = <canvas width={tileSize.x} height={tileSize.y} /> as HTMLCanvasElement;
        const ctx = tile.getContext("2d")!;

        ctx.font = "12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif";

        const tileTopLeftPoint = coords.scaleBy(tileSize);

        const tileCenterPoint = coords.add(point(0.5, 0.5)).scaleBy(tileSize);
        const tileCenter = this._map.unproject(tileCenterPoint, coords.z);
        // TODO: Replace 100 with a number calculated as the max label bbox width/height
        const renderableLabelsBbox = this.bbox(tileSize.add(point(100, 100)), tileCenter);

        const renderableLabels = this.labels.search(renderableLabelsBbox).map(entry => entry.label);
        for (const label of renderableLabels) {
            if (this.visibleLabelsSet.has(label) || !this.visibleLabels.collides(this.bboxFrom(label))) {
                // Not overlapping another label or already rendered on another tile
                this.visibleLabels.insert(this.rBushEntryFrom(label));
                this.visibleLabelsSet.add(label);

                const latLng = label.getLatLng();
                const point = this._map.project(latLng, coords.z);
                const newPoint = point.subtract(tileTopLeftPoint);
                ctx.fillText("hello", newPoint.x, newPoint.y);
            }
        }

        return tile;
    }

    public getEvents(): { [name: string]: LeafletEventHandlerFn } {
        const events = super.getEvents!();
        // Prevent layers from being invalidated after panning
        delete events["viewprereset"];
        return events;
    }

    private reloadVisibleLabelsIfZoomChanged(): void {
        const zoom = this._map.getZoom();
        if (this.visibleLabelsZoomLevel !== zoom) {
            this.labels.clear();
            const rBushEntries = this.labelsArray.map(label => this.rBushEntryFrom(label));
            this.labels.load(rBushEntries);

            this.visibleLabels.clear();
            this.visibleLabelsSet.clear();
            this.visibleLabelsZoomLevel = zoom;
        }
    }

    private rBushEntryFrom(label: Marker): RBushEntry {
        label.options
        const bbox: RBushEntry = this.bboxFrom(label) as RBushEntry;
        bbox.label = label;
        return bbox;
    }

    private bboxFrom(label: Marker): BBox {
        return this.bbox(label.options.icon!.options.iconSize!, label.getLatLng());
    }

    private bbox(size: PointExpression, center: LatLng) {
        const pointSize = point(size);
        const centerToCorner = pointSize.multiplyBy(0.5);

        const labelPoint = this._map.project(center);
        const topLeftPoint = labelPoint.subtract(centerToCorner);
        const bottomRightPoint = labelPoint.add(centerToCorner);

        const topLeft = this._map.unproject(topLeftPoint);
        const bottomRight = this._map.unproject(bottomRightPoint);

        return {
            minX: topLeft.lng,
            maxX: bottomRight.lng,
            minY: bottomRight.lat,
            maxY: topLeft.lat
        };
    }
}

export interface Label {
    getSize(): Point;
    getCenter(): LatLng;
    render(ctx: CanvasRenderingContext2D): void;
}
