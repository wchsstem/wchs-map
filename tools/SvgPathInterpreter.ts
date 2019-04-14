import * as parseSvg from "svg-path-parser";

type Command = {
    x?: number,
    y?: number,
    relative?: boolean
}

export default class SvgPathInterpreter {
    private ast: { x: number, y: number }[];

    constructor(path: string) {
        this.ast = parseSvg(path);
    }

    getPoints(): [number, number][] {
        const points: [number, number][] = [];

        let point = undefined;
        for (const command of this.ast) {
            if (!SvgPathInterpreter.isPoint(command)) {
                continue;
            }

            if (SvgPathInterpreter.isRelative(command)) {
                point = SvgPathInterpreter.getRelativePoint(command, point);
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

    private static getAbsolutePoint(command: Command, lastPoint: [number, number]): [number, number] {
        const x = "x" in command ? command.x : lastPoint[0];
        const y = "y" in command ? command.y : lastPoint[1];
        return [x, y];
    }

    private static isRelative(command: Command): boolean {
        // Works because falsy if undefined, else the actual value
        return command.relative;
    }

    private static getRelativePoint(command: Command, lastPoint: [number, number]): [number, number] {
        // Could simplify "x" in command to just command.x, but it would be more confusing
        const x = lastPoint[0] + ("x" in command ? command.x : 0);
        const y = lastPoint[1] + ("y" in command ? command.y : 0);
        return [x, y];
    }
}