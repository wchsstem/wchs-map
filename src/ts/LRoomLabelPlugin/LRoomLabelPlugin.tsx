import RBush, { BBox } from "rbush/rbush";

import "./label.scss";
import MapData from "../MapData";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import Room from "../Room";

import { h } from "../JSX";
import { settings, Watcher } from "../settings";
import Vertex from "../Vertex";
import { Some, None, Option } from "@nvarner/monads";
import { T2 } from "../Tuple";
import { Sidebar } from "../Sidebar/SidebarController";
import { divIcon, LayerGroup, LayerOptions, Marker, Polygon, polygon, Map as LMap, Icon, Layer } from "leaflet";
import { Label, LabelLayer } from "./LabelLayer";
import { TextLabel } from "./TextLabel";
import { IconLabel } from "./IconLabel";

// TODO: Wow these icons are bad. Get new ones.
const VERTEX_ICON_CLASS_PAIRS = [
    T2.new("up", "fas fa-sort-amount-up-alt"),
    T2.new("down", "fas fa-sort-amount-down-alt"),
    T2.new("stairs", "fas fa-align-justify"),
    T2.new("elevator", "fas fa-door-closed")
];
const ROOM_ICON_PAIRS = [
    T2.new("women-bathroom", "\uf182"), // fa-female
    T2.new("men-bathroom", "\uf183"), // fa-male
    T2.new("unknown-bathroom", "\uf7d8"), // fa-toilet
    T2.new("ec", "\uf037"), // fa-bolt
    T2.new("bsc", "\uf71e"), // fa-toilet-paper
    T2.new("wf", "\uf043"), // fa-tint
    T2.new("hs", "\ue06b"), // fa-pump-soap
    T2.new("bleed-control", "\uf462"), // fa-band-aid
    T2.new("aed", "\uf21e"), // fa-heartbeat
    T2.new("ahu", "\uf72e"), // fa-wind
    T2.new("idf", "\uf6ff") // fa-network-wired
];

export default class LRoomLabel extends LayerGroup implements LSomeLayerWithFloor {
    private tree: RBush<BBox>;
    private allLabels: Marker[];
    private floorNumber: string;
    private roomOutlines: Polygon[];
    private hiding: boolean;
    private removeWatcher: Option<Watcher>;
    private readonly labelLayer: LabelLayer;

    private static textWidthCanvas: HTMLCanvasElement;
    private static textWidthContext: CanvasRenderingContext2D;

    constructor(map: MapData, sidebar: Sidebar, floorNumber: string, options?: LayerOptions) {
        super([], options);

        if (!LRoomLabel.textWidthCanvas) {
            LRoomLabel.textWidthCanvas = <canvas></canvas>;
            LRoomLabel.textWidthContext = LRoomLabel.textWidthCanvas.getContext("2d")!;
            LRoomLabel.textWidthContext.font = "12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif";
        }

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

        const infrastructureMarkers: Label[] = [];
        const emergencyMarkers: Label[] = [];
        const closedMarkers: Label[] = [];

        const labels = [];

        for (const room of rooms) {
            if (room.center.getFloor() === floorNumber) {
                // const roomIcon = this.getRoomIcon(room);
                // const roomMarker =  marker(room.center.getXY(), {
                //     icon: roomIcon,
                //     interactive: true
                // });
                // roomMarker.on("click", () => {
                //     sidebar.openInfo(room);
                // });
                const roomLabel = this.getRoomLabel(room);

                if (room.outline.length !== 0) {
                    const outline = polygon(room.outline.map((point) => [point[1], point[0]]), {
                        stroke: false,
                        color: "#7DB534"
                    });
                    this.roomOutlines.push(outline);
                    // super.addLayer(outline);
                    outline.on("click", () => {
                        sidebar.openInfo(room);
                    });
                } else {
                    console.log(`Room has no outline: ${room.getName()}`);
                }

                if (room.isInfrastructure()) {
                    infrastructureMarkers.push(roomLabel);
                } else if (room.isEmergency()) {
                    emergencyMarkers.push(roomLabel);
                } else if (room.isClosed()) {
                    closedMarkers.push(roomLabel);
                } else {
                    labels.push(roomLabel);
                }
            }
        }

        // for (const vertex of vertices) {
        //     if (vertex.getLocation().getFloor() === floorNumber) {
        //         LRoomLabel.getVertexIcon(vertex).ifSome(icon => {
        //             const vertexMarker = marker(vertex.getLocation().getXY(), {
        //                 icon: icon
        //             });
        //             labels.push(vertexMarker);
        //         });
        //     }
        // }

        this.labelLayer = new LabelLayer(labels, {
            minZoom: -Infinity,
            maxZoom: Infinity,
            updateWhenZooming: false,
            keepBuffer: 5,
            updateWhenIdle: true,
            pane: "overlayPane"
        });
        super.addLayer(this.labelLayer);

        // settings.addWatcher("show-infrastructure", new Watcher(shouldShowUnknown => {
        //     const shouldShow = shouldShowUnknown as boolean;
        //     if (shouldShow) {
        //         infrastructureMarkers.forEach(marker => this.addLayer(marker));
        //     } else {
        //         infrastructureMarkers.forEach(marker => this.removeLayer(marker));
        //     }
        //     this.reload();
        // }));

        // settings.addWatcher("show-emergency", new Watcher(shouldShowUnknown => {
        //     const shouldShow = shouldShowUnknown as boolean;
        //     if (shouldShow) {
        //         emergencyMarkers.forEach(marker => this.addLayer(marker));
        //     } else {
        //         emergencyMarkers.forEach(marker => this.removeLayer(marker));
        //     }
        //     this.reload();
        // }));

        // settings.addWatcher("show-closed", new Watcher(shouldShowUnknown => {
        //     const shouldShow = shouldShowUnknown as boolean;
        //     if (shouldShow) {
        //         closedMarkers.forEach(marker => this.addLayer(marker));
        //     } else {
        //         closedMarkers.forEach(marker => this.removeLayer(marker));
        //     }
        //     this.reload();
        // }));
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }

    addLayer(layer: Marker): this {
        super.addLayer(layer);
        this.allLabels.push(layer);
        return this;
    }

    removeLayer(layer: Marker): this {
        super.removeLayer(layer);
        this.allLabels = this.allLabels.filter(currentLayer => currentLayer !== layer);
        return this;
    }

    onAdd(map: LMap): this {
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

    onRemove(map: LMap): this {
        super.onRemove(map);

        settings.removeWatcher("show-markers", this.removeWatcher.unwrap());
        this.removeWatcher = None;

        map.removeEventListener("zoomend", this.reload, this);
        
        return this;
    }

    reload() {
        this.tree.clear();

        if (!this.hiding) {
            this.showVisibleLayers();
        }
    }

    private showVisibleLayers() {
        // const iconBBoxs = this.allLabels
        //     .filter(LRoomLabel.layerIsMarker)
        //     .map(LRoomLabel.pairMarkerWithBBox);
        // const toShow = [];
        // for (const iconBBox of iconBBoxs) {
        //     if (!this.tree.collides(iconBBox.e1)) {
        //         // Can be seen
        //         toShow.push(iconBBox.e0);
        //         this.tree.insert(iconBBox.e1);
        //     }
        // }
    }

    private static getIcon(pairs: T2<string, string>[], tags: string[]): Option<string> {
        return pairs.map(pair => tags.includes(pair.e0) ? Some(pair.e1) : None)
            .reduce((acc, className) => acc.or(className));
    }

    private getRoomLabel(room: Room): Label {
        const icon = LRoomLabel.getIcon(ROOM_ICON_PAIRS, room.getTags());

        return icon.match({
            some: icon => {
                return new IconLabel(room.center.getXY(), icon) as Label;
            },
            none: () => {
                const text = room.getShortName();
                return new TextLabel(room.center.getXY(), text);
            }
        });
    }

    private getRoomIcon(room: Room): Icon<any> {
        // const iconDivClassName = room.tags.includes("closed") ? "closed room-icon" : "room-icon";
        // const iconClassName = LRoomLabel.getIconClass(ROOM_ICON_PAIRS, room.getTags());

        // return iconClassName.match({
        //     some: iconClassName => divIcon({
        //         html: <i class={iconClassName} />,
        //         className: iconDivClassName,
        //         iconSize: [28, 28]
        //     }),
        //     none: () => {
        //         const iconText = room.getShortName();
        //         return divIcon({
        //             html: <div>{iconText}</div>,
        //             className: "room-label",
        //             iconSize: LRoomLabel.textSize(iconText)
        //         });
        //     }
        // });
        throw "no";
    }

    private static textSize(text: string): [number, number] {
        const words = text.split(" ");
        return words
            .map(LRoomLabel.wordSize)
            .reduce(
                ([maxWidth, totalHeight], [currWidth, currHeight]) =>
                    [Math.max(maxWidth, currWidth), totalHeight + currHeight]);
    }

    private static wordSize(word: string): [number, number] {
        // 'm' for extra padding because this seems to underestimate
        const metrics = LRoomLabel.textWidthContext.measureText(word + "m");
        return [
            metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
            1.5 * (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
        ];
    }

    private static getVertexIcon(vertex: Vertex): Option<Icon<any>> {
        // return LRoomLabel.getIconClass(VERTEX_ICON_CLASS_PAIRS, vertex.getTags())
        //     .map(iconClass => divIcon({
        //         html: <i class={iconClass}></i> as HTMLElement,
        //         className: "icon",
        //         iconSize: [28, 28]
        //     }));
        throw "no";
    }

    private static layerIsMarker(layer: Layer): boolean {
        // TODO: find a better way to tell (i.e. less hacky, documented, works even if layer is hidden)
        return "_icon" in layer && layer["_icon"] != null;
    }
}
