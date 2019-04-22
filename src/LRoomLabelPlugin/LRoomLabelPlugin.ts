import * as L from "leaflet";

// @ts-ignore rbush does export default
import { default as rbush } from "rbush";

import "./label.scss";

export default class LRoomLabel extends L.LayerGroup {
    private tree: any;
    private hiddenLayers: L.Marker[];

    constructor(options?: L.LayerOptions){
        super([], options);
        this.tree = rbush();
        this.hiddenLayers = [];
    }

    addLayer(layer: L.Marker):  this {
        super.addLayer(layer);
        this.hiddenLayers.push(layer);
        return this;
    }

    enableCollision() {
        const rbushBoxes = [];
        for (const layer of this.hiddenLayers) {
            rbushBoxes.push(LRoomLabel.bbToRbush(layer["_icon"].getBoundingClientRect()));
        }
        this.tree.load(rbushBoxes);
        this.hideAllLayers();
    }

    private hideAllLayers() {
        const shownLayers = super.getLayers();
        for (const layer of shownLayers) {
            if (layer instanceof L.Marker) {
                this.hiddenLayers.push(layer);
            }
            super.removeLayer(layer);
        }
    }

    private createRbushIndex(){}

    private static bbToRbush(bb: ClientRect): { minX: number, minY: number, maxX: number, maxY: number } {
        return {
            minX: bb.left,
            minY: bb.bottom,
            maxX: bb.right,
            maxY: bb.top
        };
    }
}