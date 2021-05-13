import { LatLng, point, Point } from "leaflet";
import { Label, LabelLayer } from "./LabelLayer";
import { h } from "../JSX";

export class TextLabel implements Label {
    private readonly size: Point;
    private readonly center: LatLng;
    private readonly linesSizes: [string, Point][];

    private static textMeasureCtx: CanvasRenderingContext2D | undefined;

    private static readonly LINE_SPACING_PX = 3;

    public constructor(center: LatLng, content: string) {
        const lines = content.split(" ");
        const sizeLinesSizes = TextLabel.measureLines(lines);

        this.size = sizeLinesSizes[0];
        this.center = center;
        this.linesSizes = sizeLinesSizes[1];
    }

    public getSize(): Point {
        return this.size;
    }

    public getCenter(): LatLng {
        return this.center;
    }

    public render(ctx: CanvasRenderingContext2D, centeredAt: Point): void {
        ctx.font = LabelLayer.FONT;
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
            const left = lineTopLeft.x + ((this.size.x - size.x) / 2);
            const bottom = lineTopLeft.y + size.y;
            ctx.fillText(line, left, bottom);
            lineTopLeft.y += size.y + TextLabel.LINE_SPACING_PX;
        }
    }

    private static measureLines(lines: string[]): [Point, [string, Point][]] {
        if (TextLabel.textMeasureCtx === undefined) {
            TextLabel.textMeasureCtx = (<canvas /> as HTMLCanvasElement).getContext("2d")!;
            TextLabel.textMeasureCtx.font = LabelLayer.FONT;
        }
        const ctx = TextLabel.textMeasureCtx;

        const linesSizes = lines
            .map(line => [line, ctx.measureText(line)] as [string, TextMetrics])
            .map(lineMetrics => {
                const metrics = lineMetrics[1];
                const lineSize = point(
                    metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
                    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
                );
                return [lineMetrics[0], lineSize] as [string, Point];
            });
        const size = linesSizes.reduce((totalSize, lineSize) => {
            const size = lineSize[1];
            const x = Math.max(totalSize.x, size.x);
            const y = totalSize.y + size.y;
            return point(x, y);
        }, point(0, (linesSizes.length - 1) * TextLabel.LINE_SPACING_PX));
        return [size, linesSizes];
    }
}