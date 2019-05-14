import * as fs from "fs";

import SvgReader from "./SvgReader";

(async () => {
    try {
        const mapData = JSON.parse(await new Promise((resolve, reject) => {
            fs.readFile("src/map.json", (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.toString());
            });
        }));

        for (const floor in mapData["map_images"]) {
            const rooms = await new SvgReader(`src/${mapData["map_images"][floor]}`).getPromise();

            for (const roomsKey in rooms) {
                if (mapData.rooms[roomsKey] === undefined) {
                    console.log(`Unknown room: ${roomsKey}`);
                    continue;
                }

                for (const key in rooms[roomsKey]) {
                    mapData.rooms[roomsKey][key] = rooms[roomsKey][key];
                }
            }
        }

        await new Promise((resolve, reject) => {
            fs.writeFile("dist/map.json", JSON.stringify(mapData), (err) => {
                reject(err);
            });
        });
    } catch (err) {
        console.error(err);
    }
})();
