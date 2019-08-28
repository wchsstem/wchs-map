import * as L from "leaflet";
// @ts-ignore rbush does export default
import { default as rbush } from "rbush";

import "./label.scss";
import MapData from "../ts/MapData";
import { genRoomPopup } from "../GenHtml/GenHtml";
import { SidebarState, SidebarController } from "../Sidebar/SidebarController";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";

export default class LRoomLabel extends L.LayerGroup implements LSomeLayerWithFloor {
    private tree: any;
    private hiddenLayers: L.Marker[];
    private floorNumber: string;

    constructor(map: MapData, floorNumber: string,
    sidebarController: SidebarController, options?: L.LayerOptions) {
        super([], options);
        this.tree = rbush();
        this.hiddenLayers = [];
        this.floorNumber = floorNumber;

        for (const room of map.getAllRooms()) {
            const entrances = room.getEntrances();
            if (entrances.length > 0 && map.getGraph().getVertex(entrances[0]).getFloor() === floorNumber) {
                const location = room.getCenter() ? room.getCenter() :
                    map.getGraph().getVertex(room.getEntrances()[0]).getLocation();
                
                const roomNumberMarker =  L.marker([location[1], location[0]], {
                    "icon": L.divIcon({
                        "html": room.getShortName(),
                        className: "room-label"
                    }),
                    "interactive": true
                });
                room.setNumberMarker(roomNumberMarker);
                roomNumberMarker.bindPopup(genRoomPopup(room, () => {
                    sidebarController.setState(SidebarState.NAVIGATION);
                    sidebarController.setNavTo(room);
                }));
                roomNumberMarker.on("click", () => {
                    roomNumberMarker.openPopup();
                    super.addLayer(L.polygon(room.getOutline()));
                });
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
            const rbushBb = layer["bb"];
            if (this.tree.search(rbushBb).length === 1) {
                layer["_icon"].classList.remove("invisible");
            } else {
                this.tree.remove(rbushBb);
            }
        }
    }

    private hideAllLayers() {
        const shownLayers = super.getLayers();
        for (const layer of shownLayers) {
            layer["_icon"].classList.add("invisible");
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
}
