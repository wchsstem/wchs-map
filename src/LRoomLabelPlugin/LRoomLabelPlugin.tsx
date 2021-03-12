import * as L from "leaflet";
import RBush, { BBox } from "rbush/rbush";

import "./label.scss";
import MapData from "../ts/MapData";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { showRoomInfo } from "../Sidebar/SidebarController";
import Room from "../ts/Room";

import { h } from "../ts/JSX";

export default class LRoomLabel extends L.LayerGroup implements LSomeLayerWithFloor {
    private tree: RBush<BBox>;
    private hiddenLayers: L.Marker[];
    private floorNumber: string;
    private roomOutlines: L.Polygon[];

    constructor(map: MapData, floorNumber: string, options?: L.LayerOptions) {
        super([], options);
        this.tree = new RBush();
        this.hiddenLayers = [];
        this.floorNumber = floorNumber;
        this.roomOutlines = [];

        // First room will be smallest, last will be largest
        // Later rooms' labels will end up on top of earlier rooms'
        // So, this prioritizes larger (heuristically more important) rooms
        const rooms = map.getAllRooms().sort((a: Room, b: Room) => b.area - a.area);

        for (const room of rooms) {
            if (room.center.floor === floorNumber) {
                const roomIcon = this.getRoomIcon(room);
                const roomMarker =  L.marker(room.center.xy, {
                    icon: roomIcon,
                    interactive: true
                });
                roomMarker.on("click", () => {
                    showRoomInfo(room);
                });

                if (room.outline.length !== 0) {
                    const outline = L.polygon(room.outline.map((point) => [point[1], point[0]]), {
                        stroke: false,
                        color: "#7DB534"
                    });
                    this.roomOutlines.push(outline);
                    super.addLayer(outline);
                    outline.on("click", () => {
                        showRoomInfo(room);
                    });
                } else {
                    console.log(`Room has no outline: ${room.getName()}`);
                }

                this.addLayer(roomMarker);
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
        this.hideAllLayers();

        this.tree.clear();
        this.showVisibleLayers();
    }

    private showVisibleLayers() {
        this.hiddenLayers
            .filter(LRoomLabel.layerIsMarker)
            .forEach(marker => this.showMarkerIfVisible(marker));
    }

    private hideAllLayers() {
        const shownLayers = super.getLayers();
        for (const layer of shownLayers) {
            if (LRoomLabel.layerIsMarker(layer)) {
                // This is very hacky and uses undocumented functionality
                // @ts-ignore: can't index "_icon" but does exist on object
                const icon: HTMLElement = layer["_icon"];
                icon.classList.add("invisible");
            }
        }
    }

    private centerLabels() {
        for (const label of this.hiddenLayers) {
            // This is very hacky and uses undocumented functionality
            // @ts-ignore: can't index "_icon" but does exist on object
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

    private showMarkerIfVisible(marker: L.Marker) {
        // This is all very hacky and uses undocumented functionality

        // @ts-ignore: _icon does exist on marker
        const icon: HTMLElement = marker["_icon"];
        const clientRect = icon.getBoundingClientRect();
        const box = LRoomLabel.toBBox(clientRect);

        if (!this.tree.collides(box)) {
            // Can be seen
            icon.classList.remove("invisible");
            this.tree.insert(box);
        }
    }

    private getRoomIcon(room: Room): L.Icon<any> {
        const iconClassName = room.tags.includes("closed") ? "closed room-icon" : "room-icon";

        if (room.tags.includes("women-bathroom")) {
            return L.divIcon({
                html: <i class="fas fa-female"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("men-bathroom")) {
            return L.divIcon({
                html: <i class="fas fa-male"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("unknown-bathroom")) {
            return L.divIcon({
                html: <i class="fas fa-toilet"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("ec")) {
            return L.divIcon({
                html: <i class="fas fa-bolt"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("bsc")) {
            return L.divIcon({
                html: <i class="fas fa-toilet-paper"></i> as HTMLElement,
                className: iconClassName
            });
        } else {
            return L.divIcon({
                html: room.getShortName(),
                className: "room-label"
            });
        }
    }

    private static layerIsMarker(layer: L.Layer): boolean {
        // TODO: find a better way to tell (i.e. less hacky, documented, works even if layer is hidden)
        return "_icon" in layer;
    }

    private static toBBox(from: ClientRect): BBox {
        return {
            minX: from.left,
            minY: from.top,
            maxX: from.right,
            maxY: from.bottom
        };
    }
}
