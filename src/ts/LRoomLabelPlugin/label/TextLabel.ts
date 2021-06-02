import { LatLng, point, Point } from "leaflet";
import { LABEL_FONT, LABEL_LINE_SPACING_PX } from "../../config";
import { TextMeasurer } from "../../TextMeasurer";
import { zip } from "../../utils";
import { Label } from "./LabelLayer";

export class TextLabel implements Label {
    private readonly size: Point;
    private readonly linesSizes: [string, Point][];

    public constructor(textMeasurer: TextMeasurer, private readonly center: LatLng, content: string) {
        const lines = content.split(" ");
        const [size, lineSizes] = textMeasurer.measureLines(lines, LABEL_LINE_SPACING_PX, LABEL_FONT);

        this.size = size;
        this.linesSizes = zip(lines, lineSizes);
    }

    public getSize(): Point {
        return this.size;
    }

    public getCenter(): LatLng {
        return this.center;
    }

    public render(ctx: CanvasRenderingContext2D, centeredAt: Point): void {
        ctx.font = LABEL_FONT;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        this.renderLines(this.linesSizes, ctx, centeredAt.add(point(1, 1)));
        this.renderLines(this.linesSizes, ctx, centeredAt.add(point(1, -1)));
        this.renderLines(this.linesSizes, ctx, centeredAt.add(point(-1, -1)));
        this.renderLines(this.linesSizes, ctx, centeredAt.add(point(-1, 1)));
        ctx.fillStyle = "#000000";
        this.renderLines(this.linesSizes, ctx, centeredAt);
    }

    private renderLines(linesSizes: [string, Point][], ctx: CanvasRenderingContext2D, centeredAt: Point): void {
        const lineTopLeft = centeredAt.subtract(this.size.divideBy(2));
        for (const [line, size] of linesSizes) {
            const left = lineTopLeft.x + (this.size.x / 2);
            const bottom = lineTopLeft.y + size.y;
            ctx.fillText(line, left, bottom);
            lineTopLeft.y += size.y + LABEL_LINE_SPACING_PX;
        }
    }
}