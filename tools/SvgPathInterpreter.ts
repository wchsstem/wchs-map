import { parseSVG, Command } from "svg-path-parser";

export default class SvgPathInterpreter {
    private path: Command[];

    constructor(path: string) {
        this.path = parseSVG(path);
    }

    getPoints(): [number, number][] {
        const points: [number, number][] = [];

        let point = null;
        for (const command of this.path) {
            if (!SvgPathInterpreter.isPoint(command)) {
                continue;
            }

            if (SvgPathInterpreter.isRelative(command)) {
                point = SvgPathInterpreter.getRelativePoint(command, point as [number, number]);
            } else {
                point = SvgPathInterpreter.getAbsolutePoint(command, point);
            }
            points.push(point);
        }
        
        return points;
    }

    private static isPoint(command: Command): boolean {
        return "x" in command || "y" in command;
    }

    private static getAbsolutePoint(command: Command, lastPoint: [number, number] | null): [number, number] {
        const x = "x" in command ? command.x : (lastPoint as [number, number])[0];
        const y = "y" in command ? command.y : (lastPoint as [number, number])[1];
        return [x, y];
    }

    private static isRelative(command: Command): boolean {
        // Works because falsy if undefined, else the actual value
        return !!command.relative;
    }

    private static getRelativePoint(command: Command, lastPoint: [number, number]): [number, number] {
        // Could simplify "x" in command to just command.x, but it would be more confusing
        const x = lastPoint[0] + ("x" in command ? command.x : 0);
        const y = lastPoint[1] + ("y" in command ? command.y : 0);
        return [x, y];
    }
}