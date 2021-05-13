import { fromMap } from "@nvarner/monads";
import { Coords, GridLayer, GridLayerOptions, LatLng, LeafletEventHandlerFn, LeafletMouseEvent, Map as LMap, Point, point, PointExpression } from "leaflet";
import RBush, { BBox } from "rbush/rbush";
import { h } from "../../JSX";

/**
 * RBush entry representing the LatLang bounding box around a Label
 */
type RBushEntry = {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    label: Label
}

export class LabelLayer extends GridLayer {
    private readonly labels: Label[];
    private readonly clickableLabels: ClickableLabel[];
    private readonly visibleLabels: Map<number, VisibleLabels>;

    public static readonly FONT = "12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif";
    public static readonly LABEL_MIN_SPACING_PX = 3;

    public constructor(labels: Label[], options?: GridLayerOptions) {
        super(options);
        this.labels = labels;
        this.clickableLabels = labels.filter(label => isClickable(label)) as ClickableLabel[];
        this.visibleLabels = new Map();
    }

    protected createTile(coords: Coords): HTMLElement {
        const tileSize = this.getTileSize();

        const pixelRatio = devicePixelRatio ?? 1;
        const tile = <canvas width={tileSize.x * pixelRatio} height={tileSize.y * pixelRatio} /> as HTMLCanvasElement;
        const ctx = tile.getContext("2d")!;
        ctx.scale(pixelRatio, pixelRatio);

        ctx.font = LabelLayer.FONT;

        const tileTopLeftPoint = coords.scaleBy(tileSize);

        const tileCenterPoint = coords.add(point(0.5, 0.5)).scaleBy(tileSize);
        const tileCenter = this._map.unproject(tileCenterPoint, coords.z);

        if (!this.visibleLabels.has(coords.z)) {
            this.visibleLabels.set(coords.z, new VisibleLabels(this.labels, coords.z, this._map));
        }
        const visibleLabels = this.visibleLabels.get(coords.z)!;

        const renderableLabels = visibleLabels.getLabels(tileSize, tileCenter);
        for (const label of renderableLabels) {
            const latLng = label.getCenter();
            const point = this._map.project(latLng, coords.z);
            const canvasPoint = point.subtract(tileTopLeftPoint);
            label.render(ctx, canvasPoint);
        }

        return tile;
    }

    public getEvents(): { [name: string]: LeafletEventHandlerFn } {
        const events = super.getEvents!();
        // Prevent layers from being invalidated after panning
        delete events["viewprereset"];
        events["click"] = e => {
            const me = e as LeafletMouseEvent;
            fromMap(this.visibleLabels, this._map.getZoom()).ifSome(visibleLabels => {
                const clickedLabels = visibleLabels.getLabels(point(1, 1), me.latlng)
                    .filter(label =>
                        isClickable(label)
                        && label.didClickLabel(me, this._map, this._map.getZoom())) as ClickableLabel[];
                if (clickedLabels.length > 0) {
                    clickedLabels[0].onClick(me);
                }
            });
        };
        return events;
    }
}

class VisibleLabels {
    private readonly zoom: number;
    private readonly map: LMap;
    private readonly visibleLabelIndex: RBush<RBushEntry>;

    public constructor(labels: Label[], zoom: number, map: LMap) {
        this.zoom = zoom;
        this.map = map;

        const visibleLabels = new RBush();
        const visibleLabelsEntries = [];

        for (const label of labels) {
            const bbox = this.bboxFrom(label);
            bbox.maxX += LabelLayer.LABEL_MIN_SPACING_PX;
            bbox.maxY += LabelLayer.LABEL_MIN_SPACING_PX;
            bbox.minX -= LabelLayer.LABEL_MIN_SPACING_PX;
            bbox.minY -= LabelLayer.LABEL_MIN_SPACING_PX;

            if (!visibleLabels.collides(bbox)) {
                const entry = this.rBushEntryFrom(label);
                visibleLabels.insert(entry);
                visibleLabelsEntries.push(entry);
            }
        }

        this.visibleLabelIndex = new RBush();
        this.visibleLabelIndex.load(visibleLabelsEntries);
    }

    public getLabels(within: Point, center: LatLng): Label[] {
        // TODO: Replace 100 with a number calculated as the max label bbox width/height
        const bbox = this.bbox(within, center);
        return this.visibleLabelIndex.search(bbox).map(entry => entry.label);
    }

    private rBushEntryFrom(label: Label): RBushEntry {
        const bbox: RBushEntry = this.bboxFrom(label) as RBushEntry;
        bbox.label = label;
        return bbox;
    }

    private bboxFrom(label: Label): BBox {
        return this.bbox(label.getSize(), label.getCenter());
    }

    private bbox(size: PointExpression, center: LatLng): BBox {
        const pointSize = point(size);
        const centerToCorner = pointSize.multiplyBy(0.5);

        const labelPoint = this.map.project(center, this.zoom);
        const topLeftPoint = labelPoint.subtract(centerToCorner);
        const bottomRightPoint = labelPoint.add(centerToCorner);

        const topLeft = this.map.unproject(topLeftPoint, this.zoom);
        const bottomRight = this.map.unproject(bottomRightPoint, this.zoom);

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

export type ClickListener = (e: LeafletMouseEvent) => void;

export interface ClickableLabel extends Label {
    addClickListener(listener: ClickListener): void;
    didClickLabel(e: LeafletMouseEvent, map: LMap, zoom: number): boolean;
    onClick(e: LeafletMouseEvent): void;
}

export function isClickable(label: Label): label is ClickableLabel {
    return "addClickListener" in label && "didClickLabel" in label && "onClick" in label;
}
