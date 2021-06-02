import { Err, Ok, Result } from "@nvarner/monads";
import { point, Point } from "leaflet";

export function textMeasurerFactory(): Result<TextMeasurer, string> {
    return TextMeasurer.new();
}
textMeasurerFactory.inject = [] as const;

/** Measures the dimensions of text */
export class TextMeasurer {
    /** Canvas ctx used to measure text */
    private readonly ctx: CanvasRenderingContext2D;

    /**
     * Create a new `TextMeasurer`
     * @returns New `Some(TextMeasurer)` if construction succeeds, `Err(message)` if the construction fails
     */
    public static new(): Result<TextMeasurer, string> {
        const ctx = document.createElement("canvas").getContext("2d");
        if (ctx !== null) {
            return Ok(new TextMeasurer(ctx));
        } else {
            return Err("could not get canvas 2d context in TextMeasurer");
        }
    }

    private constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    /**
     * Get the size of a single line
     * @param font CSS font string representing the font to measure the text in. Should set at least font size and
     * font-family.
     */
    public measureOneLine(line: string, font: string): Point {
        this.ctx.font = font;
        const lineMetrics = this.ctx.measureText(line);
        const width = lineMetrics.actualBoundingBoxLeft + lineMetrics.actualBoundingBoxRight;
        const height = lineMetrics.actualBoundingBoxAscent + lineMetrics.actualBoundingBoxDescent;
        return point(width, height);
    }

    /**
     * Get the total size of several lines and the individual size of each line
     * @param lines Array of lines of text to measure
     * @param lineSpacingPx Distance in pixels between the end of one line and the start of the next
     * @param font CSS font string representing the font to measure the text in. Should set at least font size and
     * font-family.
     * @returns `[total size, size of each line[]]`; The total size is the combined size of each line plus the line
     * spacing between each line, and each line's size is the size of the text without extra spacing
     */
    public measureLines(lines: string[], lineSpacingPx: number, font: string): [Point, Point[]] {
        const linesSizes = lines.map(line => this.measureOneLine(line, font));
        const size = linesSizes.reduce((totalSize, lineSize) => {
            const width = Math.max(totalSize.x, lineSize.x);
            const height = totalSize.y + lineSize.y;
            return point(width, height);
        }, point(0, (linesSizes.length - 1) * lineSpacingPx));
        return [size, linesSizes];
    }
}