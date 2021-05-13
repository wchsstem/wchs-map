import MapData from "../MapData";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import Room from "../Room";

import { settings, Watcher } from "../settings";
import Vertex from "../Vertex";
import { Some, None, Option } from "@nvarner/monads";
import { T2 } from "../Tuple";
import { Sidebar } from "../Sidebar/SidebarController";
import { LayerGroup, LayerOptions, Marker, Map as LMap, latLng } from "leaflet";
import { Label, LabelLayer } from "./label/LabelLayer";
import { TextLabel } from "./label/TextLabel";
import { IconLabel } from "./label/IconLabel";
import { Outline, OutlineLayer } from "./OutlineLayer";

// TODO: Wow these icons are bad. Get new ones.
const VERTEX_ICON_PAIRS = [
    T2.new("up", "\uf885"), // fa-sort-amount-up-alt
    T2.new("down", "\uf884"), // fa-sort-amount-down-alt
    T2.new("stairs", "\uf039"), // fa-align-justify
    T2.new("elevator", "\uf52a"), // fa-door-closed
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
    private allLabels: Marker[];
    private floorNumber: string;
    private removeWatcher: Option<Watcher>;
    private readonly labelLayer: LabelLayer;
    private readonly outlineLayer: OutlineLayer;

    constructor(map: MapData, floorNumber: string, options?: LayerOptions) {
        super([], options);

        this.allLabels = [];
        this.floorNumber = floorNumber;
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

        const outlines = [];
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

                if (room.outline.length !== 0) {
                    const outline = new Outline(room.outline.map(point => latLng(point[1], point[0])));
                    outlines.push(outline);
                    // outline.on("click", () => {
                    //     sidebar.openInfo(room);
                    // });
                } else {
                    console.log(`Room has no outline: ${room.getName()}`);
                }

                const roomLabel = this.getRoomLabel(room);
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

        vertices
            .filter(vertex => vertex.getLocation().getFloor() === floorNumber)
            .forEach(vertex => LRoomLabel.getVertexLabel(vertex).ifSome(label => labels.push(label)));
        
        this.outlineLayer = new OutlineLayer(outlines, {
            minZoom: -Infinity,
            maxZoom: Infinity,
            pane: "overlayPane"
        });
        super.addLayer(this.outlineLayer);

        this.labelLayer = new LabelLayer(labels, {
            minZoom: -Infinity,
            maxZoom: Infinity,
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

        const watcher = new Watcher(shouldShowUnknown => {
            const shouldShow = shouldShowUnknown as boolean;
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
        
        return this;
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

    private static getVertexLabel(vertex: Vertex): Option<Label> {
        return LRoomLabel.getIcon(VERTEX_ICON_PAIRS, vertex.getTags())
            .map(icon => new IconLabel(vertex.getLocation().getXY(), icon));
    }
}
