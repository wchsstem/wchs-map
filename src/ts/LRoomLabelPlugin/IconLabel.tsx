import { LatLng, Point, point } from "leaflet";
import { Label } from "./LabelLayer";
import { h } from "../JSX";

export class IconLabel implements Label {
    private readonly center: LatLng;
    private readonly icon: string;
    private readonly iconSize: Point;

    private static textMeasureCtx: CanvasRenderingContext2D | undefined;

    private static readonly RADIUS_PX = 14;
    private static readonly BORDER_PX = 2;
    private static readonly ICON_FONT = "900 14px \"Font Awesome 5 Free\"";
    private static readonly ICON_VERTICAL_OFFSET_PX = 1;

    public constructor(center: LatLng, icon: string) {
        this.center = center;
        this.icon = icon;
        this.iconSize = IconLabel.measureIcon(icon);
    }

    public getSize(): Point {
        return point(2 * IconLabel.RADIUS_PX, 2 * IconLabel.RADIUS_PX);
    }

    public getCenter(): LatLng {
        return this.center;
    }

    public render(ctx: CanvasRenderingContext2D, centeredAt: Point): void {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(centeredAt.x, centeredAt.y, IconLabel.RADIUS_PX, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = IconLabel.BORDER_PX;
        ctx.beginPath();
        ctx.arc(centeredAt.x, centeredAt.y, IconLabel.RADIUS_PX - (IconLabel.BORDER_PX / 2), 0, 2 * Math.PI);
        ctx.stroke();

        const oldFont = ctx.font;
        ctx.font = IconLabel.ICON_FONT;
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        const topLeft = centeredAt.subtract(this.iconSize.divideBy(2));
        ctx.fillText(this.icon, topLeft.x + (this.iconSize.x / 2), topLeft.y + this.iconSize.y - IconLabel.ICON_VERTICAL_OFFSET_PX);
        ctx.font = oldFont;
    }

    private static measureIcon(icon: string): Point {
        if (IconLabel.textMeasureCtx === undefined) {
            IconLabel.textMeasureCtx = (<canvas /> as HTMLCanvasElement).getContext("2d")!;
            IconLabel.textMeasureCtx.font = IconLabel.ICON_FONT;
        }
        const ctx = IconLabel.textMeasureCtx;

        const metrics = ctx.measureText(icon);
        // return point(
        //     metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        //     metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        // );
        return point(
            metrics.width,
            metrics.actualBoundingBoxAscent
        );
    }
}