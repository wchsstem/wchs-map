import * as L from "leaflet";
// @ts-ignore rbush does export default
import { default as rbush } from "rbush";

import "./label.scss";
import MapData from "../ts/MapData";
import { genRoomPopup } from "../GenHtml/GenHtml";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { showRoomInfo } from "../Sidebar/SidebarController";

export default class LRoomLabel extends L.LayerGroup implements LSomeLayerWithFloor {
    private tree: any;
    private hiddenLayers: L.Marker[];
    private floorNumber: string;
    private roomOutlines: L.Polygon[];

    constructor(map: MapData, floorNumber: string, options?: L.LayerOptions) {
        super([], options);
        this.tree = rbush();
        this.hiddenLayers = [];
        this.floorNumber = floorNumber;
        this.roomOutlines = [];

        for (const room of map.getAllRooms()) {
            if (room.getFloorNumber() === floorNumber) {
                const location = room.getCenter();
                const roomNumberMarker =  L.marker([location[1], location[0]], {
                    "icon": L.divIcon({
                        "html": room.getShortName(),
                        className: "room-label"
                    }),
                    "interactive": true
                });
                room.setNumberMarker(roomNumberMarker);
                roomNumberMarker.on("click", () => {
                    showRoomInfo(room);
                });

                if (room.getOutline()) {
                    const outline = L.polygon(room.getOutline().map((point) => [point[1], point[0]]), {
                        stroke: false,
                        color: "#7DB534"
                    });
                    this.roomOutlines.push(outline);
                    super.addLayer(outline);
                    outline.on("click", () => {
                        showRoomInfo(room);
                    });
                } else {
                    console.log("Bad room", room);
                }

                this.addLayer(roomNumberMarker);
            }
        }
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }

    addLayer(layer: L.Marker):  this {
        super.addLayer(layer);
        this.hiddenLayers.push(layer);
        return this;
    }

    onAdd(map: L.Map): this {
        super.onAdd(map);
        map.on("zoomend", this.reload, this);
        this.reload();
        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);
        map.removeEventListener("zoomend", this.reload, this);
        return this;
    }

    reload() {
        this.centerLabels();
        this.setupRbush();
        this.hideAllLayers();
        this.showVisibleLayers();
    }

    private showVisibleLayers() {
        for (const layer of this.hiddenLayers) {
            if (LRoomLabel.layerIsMarker(layer)) {
                const rbushBb = layer["bb"];
                if (this.tree.search(rbushBb).length === 1) {
                    layer["_icon"].classList.remove("invisible");
                } else {
                    this.tree.remove(rbushBb);
                }
            }
        }
    }

    private hideAllLayers() {
        const shownLayers = super.getLayers();
        for (const layer of shownLayers) {
            if (LRoomLabel.layerIsMarker(layer)) {
                layer["_icon"].classList.add("invisible");
            }
        }
    }

    private centerLabels() {
        for (const label of this.hiddenLayers) {
            const icon: HTMLElement = label["_icon"];
            icon.style.width = "";
            icon.style.height = "";

            const bb: ClientRect = icon.getBoundingClientRect();
            const width = bb.width;
            const height = bb.height;
            
            icon.style.marginTop = `${-(height / 2)}px`;
            icon.style.marginLeft = `${-(width / 2)}px`;
        }
    }

    private setupRbush() {
        this.tree.clear();
        const rbushBoxes = [];
        for (const layer of this.hiddenLayers) {
            layer["bb"] = LRoomLabel.bbToRbush(layer["_icon"].getBoundingClientRect());
            rbushBoxes.push(layer["bb"]);
        }
        this.tree.load(rbushBoxes);
    }

    private static bbToRbush(bb: ClientRect): { minX: number, minY: number, maxX: number, maxY: number } {
        return {
            minX: bb.left,
            minY: bb.top,
            maxX: bb.right,
            maxY: bb.bottom
        };
    }

    private static layerIsMarker(layer: L.Layer): boolean {
        // TODO: find a better way to tell (i.e. less hacky, documented, works even if layer is hidden)
        return "_icon" in layer;
    }
}
