import * as L from "leaflet";
import RBush, { BBox } from "rbush/rbush";

import "./label.scss";
import MapData from "../ts/MapData";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { showRoomInfo } from "../Sidebar/SidebarController";
import Room from "../ts/Room";

import { h } from "../ts/JSX";
import { settings, Watcher } from "../ts/settings";
import Vertex from "../Vertex";
import { Some, None, Option } from "@nvarner/monads";

export default class LRoomLabel extends L.LayerGroup implements LSomeLayerWithFloor {
    private tree: RBush<BBox>;
    private allLabels: L.Marker[];
    private floorNumber: string;
    private roomOutlines: L.Polygon[];
    private hiding: boolean;
    private removeWatcher: Option<Watcher>;

    constructor(map: MapData, floorNumber: string, options?: L.LayerOptions) {
        super([], options);
        this.tree = new RBush();
        this.allLabels = [];
        this.floorNumber = floorNumber;
        this.roomOutlines = [];
        this.hiding = false;
        this.removeWatcher = None;

        // First room will be least important, last will be most important
        // Later rooms' labels will end up on top of earlier rooms'
        // So this prioritizes more important rooms
        const rooms = map.getAllRooms().sort((a: Room, b: Room) => b.estimateImportance() - a.estimateImportance());

        const vertices = map.getGraph()
            .getIdsAndVertices()
            .map(([_id, vertex]) => vertex);

        const infrastructureMarkers: L.Marker[] = [];
        const emergencyMarkers: L.Marker[] = [];

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

                if (room.isInfrastructure()) {
                    infrastructureMarkers.push(roomMarker);
                } else if (room.isEmergency()) {
                    emergencyMarkers.push(roomMarker);
                } else {
                    this.addLayer(roomMarker);
                }
            }
        }

        for (const vertex of vertices) {
            if (vertex.getLocation().floor === floorNumber) {
                LRoomLabel.getVertexIcon(vertex).ifSome(icon => {
                    const vertexMarker =  L.marker(vertex.getLocation().xy, {
                        icon: icon
                    });
                    this.addLayer(vertexMarker);
                });
            }
        }

        settings.addWatcher("show-infrastructure", new Watcher(shouldShowUnknown => {
            const shouldShow = shouldShowUnknown as boolean;
            if (shouldShow) {
                infrastructureMarkers.forEach(marker => this.addLayer(marker));
            } else {
                infrastructureMarkers.forEach(marker => this.removeLayer(marker));
            }
            this.reload();
        }));

        settings.addWatcher("show-emergency", new Watcher(shouldShowUnknown => {
            const shouldShow = shouldShowUnknown as boolean;
            if (shouldShow) {
                emergencyMarkers.forEach(marker => this.addLayer(marker));
            } else {
                emergencyMarkers.forEach(marker => this.removeLayer(marker));
            }
            this.reload();
        }));
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }

    addLayer(layer: L.Marker): this {
        super.addLayer(layer);
        this.allLabels.push(layer);
        return this;
    }

    removeLayer(layer: L.Marker): this {
        super.removeLayer(layer);
        this.allLabels = this.allLabels.filter(currentLayer => currentLayer !== layer);
        return this;
    }

    onAdd(map: L.Map): this {
        super.onAdd(map);
        map.on("zoomend", this.reload, this);
        this.reload();

        const watcher = new Watcher(shouldShowUnknown => {
            const shouldShow = shouldShowUnknown as boolean;
            this.hiding = !shouldShow;
            if (shouldShow) {
                super.onAdd(map);
            } else {
                super.onRemove(map);
            }
        });

        settings.addWatcher("show-markers", watcher);
        this.removeWatcher = Some(watcher);

        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);

        settings.removeWatcher("show-markers", this.removeWatcher.unwrap());
        this.removeWatcher = None;

        map.removeEventListener("zoomend", this.reload, this);
        
        return this;
    }

    reload() {
        this.centerLabels();
        this.hideAllLayers();
        this.tree.clear();

        if (!this.hiding) {
            this.showVisibleLayers();
        }
    }

    private showVisibleLayers() {
        this.allLabels
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
        this.allLabels
        .filter(LRoomLabel.layerIsMarker)
        .forEach(marker => this.centerLabel(marker));
    }

    private centerLabel(label: L.Marker) {
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
        } else if (room.tags.includes("wf")) {
            return L.divIcon({
                html: <i class="fas fa-tint"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("hs")) {
            return L.divIcon({
                html: <i class="fas fa-pump-soap"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("bleed-control")) {
            return L.divIcon({
                html: <i class="fas fa-band-aid"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("aed")) {
            return L.divIcon({
                html: <i class="fas fa-heartbeat"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("ahu")) {
            return L.divIcon({
                html: <i class="fas fa-wind"></i> as HTMLElement,
                className: iconClassName
            });
        } else if (room.tags.includes("idf")) {
            return L.divIcon({
                html: <i class="fas fa-network-wired"></i> as HTMLElement,
                className: iconClassName
            });
        } else {
            return L.divIcon({
                html: room.getShortName(),
                className: "room-label"
            });
        }
    }

    // TODO: Wow these icons are bad. Get new ones.
    private static getVertexIcon(vertex: Vertex): Option<L.Icon<any>> {
        if (vertex.hasTag("up")) {
            return Some(L.divIcon({
                html: <i class="fas fa-sort-amount-up"></i> as HTMLElement,
                className: "icon"
            }));
        } else if (vertex.hasTag("down")) {
            return Some(L.divIcon({
                html: <i class="fas fa-sort-amount-down"></i> as HTMLElement,
                className: "icon"
            }));
        } else if (vertex.hasTag("stairs")) {
            return Some(L.divIcon({
                html: <i class="fas fa-align-justify"></i> as HTMLElement,
                className: "icon"
            }));
        } else if (vertex.hasTag("elevator")) {
            return Some(L.divIcon({
                html: <i class="fas fa-door-closed"></i> as HTMLElement,
                className: "icon"
            }));
        } else {
            return None;
        }
    }

    private static layerIsMarker(layer: L.Layer): boolean {
        // TODO: find a better way to tell (i.e. less hacky, documented, works even if layer is hidden)
        return "_icon" in layer && layer["_icon"] != null;
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
