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
import { divIcon, LayerGroup, marker, polygon } from "leaflet";

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

    constructor(map: MapData, sidebar: Sidebar, floorNumber: string, options?: L.LayerOptions) {
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
        const icons = this.allLabels
            .filter(LRoomLabel.layerIsMarker)
            .map(LRoomLabel.getIcon);
        // Make style updates first...
        icons.forEach(LRoomLabel.removeIconSize);
        icons
            // ...then query calculated styles so browser doesn't have to update after each update...
            .map(LRoomLabel.pairWithDesiredMargin)
            // ...then update styles again without querying to prevent need for updates
            .forEach(LRoomLabel.applyIconMargins);
    }

    private showMarkerIfVisible(marker: L.Marker) {
        // This is all very hacky and uses undocumented functionality

        // @ts-ignore: _icon does exist on marker
        const icon: HTMLElement = marker["_icon"];
        const inner = icon.firstChild as HTMLElement;
        // const clientRect = (icon.tagName === "i" ? icon : inner!).getBoundingClientRect();
        const clientRect = icon.getBoundingClientRect();
        const box = LRoomLabel.toBBox(clientRect);

        if (!this.tree.collides(box)) {
            // Can be seen
            icon.classList.remove("invisible");
            this.tree.insert(box);
        }
    }

    private static getIcon(label: L.Marker): HTMLElement {
        // This is very hacky and uses undocumented functionality
        // @ts-ignore: can't index "_icon" but does exist on object
        return label["_icon"];
    }

    private static removeIconSize(icon: HTMLElement): void {
        icon.style.removeProperty("width");
        icon.style.removeProperty("height");
    }

    private static pairWithDesiredMargin(icon: HTMLElement): T2<HTMLElement, T2<number, number>> {
        const width = getComputedStyle(icon).width;
        const height = getComputedStyle(icon).height;

        // Remove "px"
        const widthNum = parseFloat(width.substring(0, width.length - 2));
        const heightNum = parseFloat(height.substring(0, height.length - 2));

        const marginLeft = -widthNum / 2;
        const marginTop = -heightNum / 2;

        return T2.new(icon, T2.new(marginLeft, marginTop));
    }

    private static applyIconMargins(iconMargins: T2<HTMLElement, T2<number, number>>): void {
        iconMargins.e0.style.marginLeft = `${iconMargins.e1.e0}px`;
        iconMargins.e0.style.marginTop = `${iconMargins.e1.e1}px`;
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
            none: divIcon({
                html: <span>{room.getShortName()}</span>,
                className: "room-label"
            })
        });
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
