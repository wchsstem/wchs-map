import * as L from "leaflet";

// @ts-ignore rbush does export default
import { default as rbush } from "rbush";

import Room from "../Room";
import "./label.scss";

export default class LRoomLabel extends L.LayerGroup {
    private tree: object;

    constructor(options?: L.LayerOptions){
        super([], options);
        
        this.tree = rbush();
    }

    // addRooms(rooms: Room[]) {
    //     for (const room of rooms) {
    //         const vert = map.getGraph().getVertex(room.getEntrances()[0]);
    //         L.marker([vert.getLocation()[1], vert.getLocation()[0]], {
    //             "icon": L.divIcon({
    //                 "html": `<span class="label">${room.getRoomNumber()}</span>`
    //             }),
    //             "interactive": false
    //         }).addTo(labelGroup);
    //     }
    // }

    addLayer(layer: L.Marker):  this {
        super.addLayer(layer);
        console.log(layer);
        return this;
    }
}