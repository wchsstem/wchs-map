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
import { divIcon, icon, LayerGroup, marker, polygon } from "leaflet";

// TODO: Wow these icons are bad. Get new ones.
const VERTEX_ICON_CLASS_PAIRS = [
    T2.new("up", "fas fa-sort-amount-up-alt"),
    T2.new("down", "fas fa-sort-amount-down-alt"),
    T2.new("stairs", "fas fa-align-justify"),
    T2.new("elevator", "fas fa-door-closed")
];
const ROOM_ICON_CLASS_PAIRS = [
    T2.new("women-bathroom", "fas fa-female"),
    T2.new("men-bathroom", "fas fa-male"),
    T2.new("unknown-bathroom", "fas fa-toilet"),
    T2.new("ec", "fas fa-bolt"),
    T2.new("bsc", "fas fa-toilet-paper"),
    T2.new("wf", "fas fa-tint"),
    T2.new("hs", "fas fa-pump-soap"),
    T2.new("bleed-control", "fas fa-band-aid"),
    T2.new("aed", "fas fa-heartbeat"),
    T2.new("ahu", "fas fa-wind"),
    T2.new("idf", "fas fa-network-wired")
];

export default class LRoomLabel extends LayerGroup implements LSomeLayerWithFloor {
    private tree: RBush<BBox>;
    private allLabels: L.Marker[];
    private floorNumber: string;
    private roomOutlines: L.Polygon[];
    private hiding: boolean;
    private removeWatcher: Option<Watcher>;

    private static textWidthCanvas: HTMLCanvasElement;
    private static textWidthContext: CanvasRenderingContext2D;

    constructor(map: MapData, sidebar: Sidebar, floorNumber: string, options?: L.LayerOptions) {
        super([], options);

        if (!LRoomLabel.textWidthCanvas) {
            LRoomLabel.textWidthCanvas = <canvas></canvas>;
            LRoomLabel.textWidthContext = LRoomLabel.textWidthCanvas.getContext("2d")!;
            LRoomLabel.textWidthContext.font = "12px 400 \"Helvetica Neue\", Arial, Helvetica, sans-serif";
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

        const infrastructureMarkers: L.Marker[] = [];
        const emergencyMarkers: L.Marker[] = [];
        const closedMarkers: L.Marker[] = [];

        for (const room of rooms) {
            if (room.center.getFloor() === floorNumber) {
                const roomIcon = this.getRoomIcon(room);
                const roomMarker =  marker(room.center.getXY(), {
                    icon: roomIcon,
                    interactive: true
                });
                roomMarker.on("click", () => {
                    sidebar.openInfo(room);
                });

                if (room.outline.length !== 0) {
                    const outline = polygon(room.outline.map((point) => [point[1], point[0]]), {
                        stroke: false,
                        color: "#7DB534"
                    });
                    this.roomOutlines.push(outline);
                    super.addLayer(outline);
                    outline.on("click", () => {
                        sidebar.openInfo(room);
                    });
                } else {
                    console.log(`Room has no outline: ${room.getName()}`);
                }

                if (room.isInfrastructure()) {
                    infrastructureMarkers.push(roomMarker);
                } else if (room.isEmergency()) {
                    emergencyMarkers.push(roomMarker);
                } else if (room.isClosed()) {
                    closedMarkers.push(roomMarker);
                } else {
                    this.addLayer(roomMarker);
                }
            }
        }

        for (const vertex of vertices) {
            if (vertex.getLocation().getFloor() === floorNumber) {
                LRoomLabel.getVertexIcon(vertex).ifSome(icon => {
                    const vertexMarker =  marker(vertex.getLocation().getXY(), {
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

        settings.addWatcher("show-closed", new Watcher(shouldShowUnknown => {
            const shouldShow = shouldShowUnknown as boolean;
            if (shouldShow) {
                closedMarkers.forEach(marker => this.addLayer(marker));
            } else {
                closedMarkers.forEach(marker => this.removeLayer(marker));
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
        // this.removeLabelSizes();
        this.tree.clear();

        if (!this.hiding) {
            this.showVisibleLayers();
        }
    }

    private showVisibleLayers() {
        const iconBBoxs = this.allLabels
            .filter(LRoomLabel.layerIsMarker)
            .map(LRoomLabel.pairIconWithBBox);
        for (const iconBBox of iconBBoxs) {
            if (!this.tree.collides(iconBBox.e1)) {
                // Can be seen
                iconBBox.e0.classList.remove("invisible");
                this.tree.insert(iconBBox.e1);
            } else {
                // Cannot be seen
                iconBBox.e0.classList.add("invisible");
            }
        }
    }

    private static pairIconWithBBox(marker: L.Marker): T2<HTMLElement, BBox> {
        const icon = LRoomLabel.getIcon(marker);
        const clientRect = (icon.classList.contains("room-label") ? (icon.firstChild as HTMLElement) : icon).getBoundingClientRect();
        const bbox = LRoomLabel.toBBox(clientRect);
        return T2.new(icon, bbox);
    }

    private static getIcon(label: L.Marker): HTMLElement {
        // This is very hacky and uses undocumented functionality
        // @ts-ignore: can't index "_icon" but does exist on object
        return label["_icon"];
    }

    private static getIconClass(pairs: T2<string, string>[], tags: string[]): Option<string> {
        return pairs.map(pair => tags.includes(pair.e0) ? Some(pair.e1) : None)
            .reduce((acc, className) => acc.or(className));
    }

    private getRoomIcon(room: Room): L.Icon<any> {
        const iconDivClassName = room.tags.includes("closed") ? "closed room-icon" : "room-icon";
        const iconClassName = LRoomLabel.getIconClass(ROOM_ICON_CLASS_PAIRS, room.getTags());

        return iconClassName.match({
            some: iconClassName => divIcon({
                html: <i class={iconClassName} />,
                className: iconDivClassName
            }),
            none: () => {
                const iconText = room.getShortName();
                return divIcon({
                    html: <div>{iconText}</div>,
                    className: "room-label",
                    iconSize: LRoomLabel.textSize(iconText)
                });
            }
        });
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

    private static getVertexIcon(vertex: Vertex): Option<L.Icon<any>> {
        return LRoomLabel.getIconClass(VERTEX_ICON_CLASS_PAIRS, vertex.getTags())
            .map(iconClass => divIcon({
                html: <i class={iconClass}></i> as HTMLElement,
                className: "icon"
            }));
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
