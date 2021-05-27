import MapData from "../MapData";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import Room from "../Room";

import { settings, Watcher } from "../settings";
import { Vertex } from "../Vertex";
import { Some, None, Option } from "@nvarner/monads";
import { T2 } from "../Tuple";
import { LayerGroup, LayerOptions, Map as LMap, latLng, LeafletMouseEvent, LatLngBounds } from "leaflet";
import { Label, LabelLayer, isClickable } from "./label/LabelLayer";
import { TextLabel } from "./label/TextLabel";
import { IconLabel } from "./label/IconLabel";
import { Outline, OutlineLayer } from "./OutlineLayer";
import { Sidebar } from "../Sidebar/SidebarController";
import FontFaceObserver from "fontfaceobserver";

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
    T2.new("ec", "\uf0e7"), // fa-bolt
    T2.new("bsc", "\uf71e"), // fa-toilet-paper
    T2.new("wf", "\uf043"), // fa-tint
    T2.new("hs", "\ue06b"), // fa-pump-soap
    T2.new("bleed-control", "\uf462"), // fa-band-aid
    T2.new("aed", "\uf21e"), // fa-heartbeat
    T2.new("ahu", "\uf72e"), // fa-wind
    T2.new("idf", "\uf6ff"), // fa-network-wired
    T2.new("eru", "\uf128"), // fa-question
    T2.new("cp", "\uf023")
];

export interface RoomLabelLayerOptions extends LayerOptions {
    minNativeZoom: number,
    maxNativeZoom: number,
    bounds: LatLngBounds
}

export default class LRoomLabel extends LayerGroup implements LSomeLayerWithFloor {
    private readonly normalLabels: Label[];
    private readonly infrastructureLabels: Label[];
    private readonly emergencyLabels: Label[];
    private readonly closedLabels: Label[];

    private floorNumber: string;
    private removeWatcher: Option<Watcher>;
    private labelLayer: LabelLayer | undefined;

    private readonly options: RoomLabelLayerOptions;

    constructor(map: MapData, sidebar: Sidebar, floorNumber: string, options: RoomLabelLayerOptions) {
        super([], options);

        this.options = options;

        this.floorNumber = floorNumber;
        this.removeWatcher = None;

        // First room will be least important, last will be most important
        // Later rooms' labels will end up on top of earlier rooms'
        // So this prioritizes more important rooms
        const rooms = map.getAllRooms().sort((a: Room, b: Room) => b.estimateImportance() - a.estimateImportance());

        const vertices = map.getGraph()
            .getIdsAndVertices()
            .map(([_id, vertex]) => vertex);

        const infrastructureLabels: Label[] = [];
        const emergencyLabels: Label[] = [];
        const closedLabels: Label[] = [];

        const outlines: Outline[] = [];
        const labels = [];

        for (const room of rooms) {
            if (room.center.getFloor() === floorNumber) {
                if (room.outline.length !== 0) {
                    const outline = new Outline(room.outline.map(point => latLng(point[1], point[0])));
                    outline.addClickListener(_ => sidebar.openInfo(room));
                    outlines.push(outline);
                } else {
                    console.log(`Room has no outline: ${room.getName()}`);
                }

                const roomLabel = LRoomLabel.getRoomLabel(room);
                if (isClickable(roomLabel)) {
                    roomLabel.addClickListener(_ => sidebar.openInfo(room));
                }
                if (room.isInfrastructure()) {
                    infrastructureLabels.push(roomLabel);
                } else if (room.isEmergency()) {
                    emergencyLabels.push(roomLabel);
                } else if (room.isClosed()) {
                    closedLabels.push(roomLabel);
                } else {
                    labels.push(roomLabel);
                }
            }
        }

        vertices
            .filter(vertex => vertex.getLocation().getFloor() === floorNumber)
            .forEach(vertex => LRoomLabel.getVertexLabel(vertex).ifSome(label => labels.push(label)));


        this.normalLabels = labels;
        this.infrastructureLabels = infrastructureLabels;
        this.emergencyLabels = emergencyLabels;
        this.closedLabels = closedLabels;

        // Wait for FontAwesome to load so icons render properly
        const fontAwesome = new FontFaceObserver("Font Awesome 5 Free", { weight: 900 });
        fontAwesome.load("\uf462").then(() => {
            const outlineLayer = new OutlineLayer({
                outlines: outlines,
                minZoom: -Infinity,
                maxZoom: Infinity,
                minNativeZoom: this.options.minNativeZoom,
                maxNativeZoom: this.options.maxNativeZoom,
                bounds: this.options.bounds,
                pane: "overlayPane",
                tileSize: 2048
            });
            super.addLayer(outlineLayer);

            this.createLabelLayer();
            
            const recreateLabelLayer = new Watcher(_ => this.createLabelLayer());
            settings.addWatcher("show-infrastructure", recreateLabelLayer, false);
            settings.addWatcher("show-emergency", recreateLabelLayer, false);
            settings.addWatcher("show-closed", recreateLabelLayer, false);
        });
    }

    private createLabelLayer(): void {
        let labels = this.normalLabels;
        if (settings.getData("show-infrastructure").unwrap() as boolean) {
            labels = labels.concat(this.infrastructureLabels);
        }
        if (settings.getData("show-emergency").unwrap() as boolean) {
            labels = labels.concat(this.emergencyLabels);
        }
        if (settings.getData("show-closed").unwrap() as boolean) {
            labels = labels.concat(this.closedLabels);
        }

        if (this.labelLayer !== undefined) {
            super.removeLayer(this.labelLayer);
        }
        this.labelLayer = new LabelLayer({
            minZoom: -Infinity,
            maxZoom: Infinity,
            pane: "overlayPane",
            tileSize: 2048,
            labels: labels,
            minNativeZoom: this.options.minNativeZoom,
            maxNativeZoom: this.options.maxNativeZoom,
            bounds: this.options.bounds
        });
        super.addLayer(this.labelLayer);
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }

    public onAdd(map: LMap): this {
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

    public onRemove(map: LMap): this {
        super.onRemove(map);

        settings.removeWatcher("show-markers", this.removeWatcher.unwrap());
        this.removeWatcher = None;
        
        return this;
    }

    private static getIcon(pairs: T2<string, string>[], tags: string[]): Option<string> {
        return pairs.map(pair => tags.includes(pair.e0) ? Some(pair.e1) : None)
            .reduce((acc, className) => acc.or(className));
    }

    private static getRoomLabel(room: Room): Label {
        const icon = LRoomLabel.getIcon(ROOM_ICON_PAIRS, room.getTags());

        return icon.match({
            some: icon => {
                return new IconLabel(room.center.getXY(), icon, room.hasTag("closed")) as Label;
            },
            none: () => {
                const text = room.getShortName();
                return new TextLabel(room.center.getXY(), text);
            }
        });
    }

    private static getVertexLabel(vertex: Vertex): Option<Label> {
        return LRoomLabel.getIcon(VERTEX_ICON_PAIRS, vertex.getTags())
            .map(icon => new IconLabel(vertex.getLocation().getXY(), icon, false));
    }
}

export type ClickListener = (e: LeafletMouseEvent) => void;
