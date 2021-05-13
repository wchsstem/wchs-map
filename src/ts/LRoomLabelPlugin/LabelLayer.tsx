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
    label: Label
}

export class LabelLayer extends GridLayer {
    private readonly labels: RBush<RBushEntry>;
    private readonly labelsArray: Label[];

    private readonly visibleLabels: RBush<RBushEntry>;
    private readonly visibleLabelsSet: Set<Label>;
    private visibleLabelsZoomLevel: number;

    public static readonly FONT = "12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif";

    public constructor(labels: Label[], options?: GridLayerOptions) {
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

        ctx.font = LabelLayer.FONT;

        const tileTopLeftPoint = coords.scaleBy(tileSize);

        const tileCenterPoint = coords.add(point(0.5, 0.5)).scaleBy(tileSize);
        const tileCenter = this._map.unproject(tileCenterPoint, coords.z);
        // TODO: Replace 100 with a number calculated as the max label bbox width/height
        const renderableLabelsBbox = this.bbox(tileSize.add(point(100, 100)), tileCenter, coords.z);

        const renderableLabels = this.labels.search(renderableLabelsBbox).map(entry => entry.label);
        for (const label of renderableLabels) {
            if (this.visibleLabelsSet.has(label) || !this.visibleLabels.collides(this.bboxFrom(label, coords.z))) {
                // Not overlapping another label or already rendered on another tile
                this.visibleLabels.insert(this.rBushEntryFrom(label, coords.z));
                this.visibleLabelsSet.add(label);

                const latLng = label.getCenter();
                const point = this._map.project(latLng, coords.z);
                const canvasPoint = point.subtract(tileTopLeftPoint);
                label.render(ctx, canvasPoint);
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
            const rBushEntries = this.labelsArray.map(label => this.rBushEntryFrom(label, zoom));
            this.labels.load(rBushEntries);

            this.visibleLabels.clear();
            this.visibleLabelsSet.clear();
            this.visibleLabelsZoomLevel = zoom;
        }
    }

    private rBushEntryFrom(label: Label, zoom: number): RBushEntry {
        const bbox: RBushEntry = this.bboxFrom(label, zoom) as RBushEntry;
        bbox.label = label;
        return bbox;
    }

    private bboxFrom(label: Label, zoom: number): BBox {
        return this.bbox(label.getSize(), label.getCenter(), zoom);
    }

    private bbox(size: PointExpression, center: LatLng, zoom: number) {
        const pointSize = point(size);
        const centerToCorner = pointSize.multiplyBy(0.5);

        const labelPoint = this._map.project(center, zoom);
        const topLeftPoint = labelPoint.subtract(centerToCorner);
        const bottomRightPoint = labelPoint.add(centerToCorner);

        const topLeft = this._map.unproject(topLeftPoint, zoom);
        const bottomRight = this._map.unproject(bottomRightPoint, zoom);

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
    render(ctx: CanvasRenderingContext2D, centeredAt: Point): void;
}
