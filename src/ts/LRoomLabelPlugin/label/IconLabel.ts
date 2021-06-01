import { LatLng, Point, point, Map as LMap, LeafletMouseEvent } from "leaflet";
import { ClickableLabel } from "./LabelLayer";
import { ClickListener } from "../RoomLabel";
import { TextMeasurer } from "../../TextMeasurer";
import { ICON_FONT } from "../../config";

export class IconLabel implements ClickableLabel {
    private readonly textMeasurer: TextMeasurer;

    private readonly center: LatLng;
    private readonly icon: string;
    private readonly iconSize: Point;
    private readonly closed: boolean;
    private readonly clickListeners: ClickListener[];

    private static readonly RADIUS_PX = 14;
    private static readonly BORDER_PX = 2;
    private static readonly ICON_VERTICAL_OFFSET_PX = 1;

    private static readonly BORDER_COLOR = "#cccccc";
    private static readonly BACKGROUND_COLOR = "#ffffff";
    private static readonly ICON_COLOR = "#000000";

    private static readonly CLOSED_BORDER_COLOR = "#757575";
    private static readonly CLOSED_BACKGROUND_COLOR = "#a7a7a7";
    private static readonly CLOSED_ICON_COLOR = "#c93d3d";

    public constructor(textMeasurer: TextMeasurer, center: LatLng, icon: string, closed: boolean) {
        this.textMeasurer = textMeasurer;
        this.center = center;
        this.icon = icon;
        this.iconSize = this.measureIcon(icon);
        this.closed = closed;
        this.clickListeners = [];
    }

    public getSize(): Point {
        return point(2 * IconLabel.RADIUS_PX, 2 * IconLabel.RADIUS_PX);
    }

    public getCenter(): LatLng {
        return this.center;
    }

    public render(ctx: CanvasRenderingContext2D, centeredAt: Point): void {
        ctx.fillStyle = this.closed ? IconLabel.CLOSED_BACKGROUND_COLOR : IconLabel.BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.arc(centeredAt.x, centeredAt.y, IconLabel.RADIUS_PX, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = this.closed ? IconLabel.CLOSED_BORDER_COLOR : IconLabel.BORDER_COLOR;
        ctx.lineWidth = IconLabel.BORDER_PX;
        ctx.beginPath();
        ctx.arc(centeredAt.x, centeredAt.y, IconLabel.RADIUS_PX - (IconLabel.BORDER_PX / 2), 0, 2 * Math.PI);
        ctx.stroke();

        const oldFont = ctx.font;
        ctx.font = ICON_FONT;
        ctx.textAlign = "center";
        ctx.fillStyle = this.closed ? IconLabel.CLOSED_ICON_COLOR : IconLabel.ICON_COLOR;
        const topLeft = centeredAt.subtract(this.iconSize.divideBy(2));
        ctx.fillText(this.icon, topLeft.x + (this.iconSize.x / 2), topLeft.y + this.iconSize.y - IconLabel.ICON_VERTICAL_OFFSET_PX);
        ctx.font = oldFont;
    }

    public addClickListener(listener: ClickListener): void {
        this.clickListeners.push(listener);
    }

    public didClick(e: LeafletMouseEvent, map: LMap, zoom: number): boolean {
        const centerPoint = map.project(this.center, zoom);
        const clickPoint = map.project(e.latlng);
        return centerPoint.distanceTo(clickPoint) < IconLabel.RADIUS_PX;
    }

    public onClick(e: LeafletMouseEvent): void {
        for (const listener of this.clickListeners) {
            listener(e);
        }
    }

    private measureIcon(icon: string): Point {
        return this.textMeasurer.measureOneLine(icon, ICON_FONT);
    }
}