import { Parser, DomHandler } from "htmlparser2";
import * as fs from "fs";

import SvgPathInterpreter from "./SvgPathInterpreter";

type SvgElement = {
    attribs?: {
        id?: string,
        "inkscape:label"?: string,
        x?: string,
        y?: string,
        width?: string,
        height?: string,
        d?: string
    },
    children?: SvgElement[]
}

export type RoomData = {
    "center": [number, number]
}

export default class SvgReader {
    private handler: DomHandler;
    private parser: Parser;

    private rooms: Map<string, RoomData>;

    constructor(file: string) {
        this.handler = this.createHandler();
        this.parser = new Parser(this.handler);

        this.rooms = new Map();

        fs.readFile(file, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
        
            this.parser.write(data.toString());
            this.parser.end();
        });
    }

    private createHandler(): DomHandler {
        return new DomHandler((err, dom) => {
            if (err) {
                console.error(err);
                return;
            }
        
            const rooms = {};
        
            // Filter doesn't work on generators, so must write custom
            for (const element of SvgReader.domIterator(dom)) {
                if (SvgReader.isRoomElement(element)) {
                    rooms[SvgReader.getRoomNumber(element)] = {
                        "center": SvgReader.calcCenterOfSvg(element)
                    }
                }
            }
        
            console.log(rooms);
        });
    }

    private static * domIterator(dom: SvgElement[]): IterableIterator<SvgElement> {
        for (const element of dom) {
            yield element;
            if (element.children) {
                yield* SvgReader.domIterator(element["children"]);
            }
        }
    }
    
    private static isRoomElement(element: SvgElement): boolean {
        return element.attribs && element.attribs.id && /room(.+)/.test(element.attribs.id);
    }
    
    private static getRoomNumber(element: SvgElement): string {
        return /room(.+)/.exec(element.attribs.id)[1];
    }
    
    private static calcCenterOfSvg(element: SvgElement): [number, number] {
        const attribs = element.attribs;
    
        if (attribs.x && attribs.y && attribs.width && attribs.height) {
            const width = parseFloat(attribs.width);
            const height = parseFloat(attribs.height);
            const x = parseFloat(attribs.x);
            const y = parseFloat(attribs.y);
            return [
                (width - x) / 2 + x,
                (height - y) / 2 + y
            ];
        } else {
            return SvgReader.calcCenter(new SvgPathInterpreter(attribs.d).getPoints());
        }
    }

    private static calcCenter(points: [number, number][]): [number, number] {
        // Note: this just calculates the mean point. It should be replaced with a calculation for the centroid.
        return points.reduce((prev: [number, number], curr: [number, number], index: number): [number, number] => {
            return [
                index * prev[0] / (index + 1) + curr[0] / (index + 1),
                index * prev[1] / (index + 1) + curr[1] / (index + 1),
            ];
        })
    }
}
