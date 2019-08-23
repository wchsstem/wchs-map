import { Parser, DomHandler } from "htmlparser2";
import * as fs from "fs";

import SvgPathInterpreter from "./SvgPathInterpreter";

type SvgElement = {
    attribs?: {
        id?: string,
        x?: string,
        y?: string,
        width?: string,
        height?: string,
        d?: string
    },
    children?: SvgElement[]
}

type RoomData = {
    "center": [number, number]
}

type Rooms = { [roomNumber: string]: RoomData; }

export default class SvgReader {
    private promise: Promise<Rooms>;

    constructor(file: string) {
        this.promise = new Promise((resolve, reject) => {
            const handler = new DomHandler((err, dom) => {
                if (err) {
                    reject(err);
                    return;
                }
            
                const rooms = {};

                // Filter doesn't work on generators, so must write custom
                for (const element of SvgReader.domIterator(dom)) {
                    if (SvgReader.isRoomElement(element)) {
                        rooms[SvgReader.getRoomNumber(element)] = {
                            center: SvgReader.calcCenterOfSvg(element)
                        };

                        console.log("Room number: ", SvgReader.getRoomNumber(element));

                        if (SvgReader.getRoomNumber(element) === "room130C") {
                            console.log("130C:")
                            console.log(element);
                        }
                    }

                    if (!SvgReader.isRoomElement(element) && element.attribs && element.attribs.id) {
                        
                        console.log("Strange", element.attribs.id);
                    }
                }

                resolve(rooms);
            });

            const parser = new Parser(handler);

            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
            
                parser.write(data.toString());
                parser.end();
            });
                
        });
    }

    getPromise(): Promise<Rooms> {
        return this.promise;
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
            return SvgReader.transformCoords([width / 2 + x, height / 2 + y]);
        } else {
            return SvgReader.transformCoords(SvgReader.calcCenter(new SvgPathInterpreter(attribs.d).getPoints()));
        }
    }

    private static transformCoords(coords: [number, number]): [number, number] {
        return [
            0.982665546 * coords[0] + 1.734239229,
            -0.9929277691 * coords[1] + 746.6233232
        ];
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
