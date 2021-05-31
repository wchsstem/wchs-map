import { MapData } from "../MapData";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import Room from "../Room";

import { Vertex } from "../Vertex";
import { Some, None, Option } from "@nvarner/monads";
import { LayerGroup, LayerOptions, Map as LMap, latLng, LeafletMouseEvent, LatLngBounds } from "leaflet";
import { Label, LabelLayer, isClickable } from "./label/LabelLayer";
import { TextLabel } from "./label/TextLabel";
import { IconLabel } from "./label/IconLabel";
import { Outline, OutlineLayer } from "./OutlineLayer";
import { Sidebar } from "../Sidebar/SidebarController";
import FontFaceObserver from "fontfaceobserver";
import { Settings } from "../settings";
import { ICON_FOR_ROOM_TAG, ICON_FOR_VERTEX_TAG } from "../config";
import { DefinitionTag } from "../Geocoder";
import { Logger } from "../LogPane/LogPane";

export interface RoomLabelLayerOptions extends LayerOptions {
    minNativeZoom: number,
    maxNativeZoom: number,
    bounds: LatLngBounds
}

export default class LRoomLabel extends LayerGroup implements LSomeLayerWithFloor {
    private readonly settings: Settings;
    private readonly logger: Logger;

    private readonly normalLabels: Label[];
    private readonly infrastructureLabels: Label[];
    private readonly emergencyLabels: Label[];
    private readonly closedLabels: Label[];

    private floorNumber: string;
    private removeWatcher: Option<(newValue: unknown) => void>;
    private labelLayer: LabelLayer | undefined;

    private readonly options: RoomLabelLayerOptions;

    constructor(
        map: MapData,
        sidebar: Sidebar,
        settings: Settings,
        logger: Logger,
        floorNumber: string,
        options: RoomLabelLayerOptions
    ) {
        super([], options);

        this.options = options;

        this.settings = settings;
        this.logger = logger;

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

                const roomLabel = this.getRoomLabel(room);
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
            .forEach(vertex => this.getVertexLabel(vertex).ifSome(label => labels.push(label)));


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
            }, logger);
            super.addLayer(outlineLayer);

            this.createLabelLayer();
            
            const recreateLabelLayer = () => this.createLabelLayer();
            settings.addWatcher("show-infrastructure", recreateLabelLayer, false);
            settings.addWatcher("show-emergency", recreateLabelLayer, false);
            settings.addWatcher("show-closed", recreateLabelLayer, false);
        });
    }

    private createLabelLayer(): void {
        let labels = this.normalLabels;
        if (this.settings.getData("show-infrastructure").unwrap() as boolean) {
            labels = labels.concat(this.infrastructureLabels);
        }
        if (this.settings.getData("show-emergency").unwrap() as boolean) {
            labels = labels.concat(this.emergencyLabels);
        }
        if (this.settings.getData("show-closed").unwrap() as boolean) {
            labels = labels.concat(this.closedLabels);
        }

        if (this.labelLayer !== undefined) {
            super.removeLayer(this.labelLayer);
        }
        this.labelLayer = new LabelLayer(this.logger, {
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

        const watcher = (shouldShowUnknown: unknown) => {
            const shouldShow = shouldShowUnknown as boolean;
            if (shouldShow) {
                super.onAdd(map);
            } else {
                super.onRemove(map);
            }
        };

        this.settings.addWatcher("show-markers", watcher);
        this.removeWatcher = Some(watcher);

        return this;
    }

    public onRemove(map: LMap): this {
        super.onRemove(map);

        this.settings.removeWatcher("show-markers", this.removeWatcher.unwrap());
        this.removeWatcher = None;

        return this;
    }

    private static getIcon(pairs: [string, string][], tags: string[]): Option<string> {
        return pairs.map(([tag, icon]) => tags.includes(tag) ? Some(icon) : None)
            .reduce((acc, className) => acc.or(className));
    }

    private getRoomLabel(room: Room): Label {
        const icon = LRoomLabel.getIcon(ICON_FOR_ROOM_TAG, room.getTags());

        return icon.match({
            some: icon => {
                return new IconLabel(this.logger, room.center.getXY(), icon, room.hasTag(DefinitionTag.Closed)) as Label;
            },
            none: () => {
                const text = room.getShortName();
                return new TextLabel(room.center.getXY(), text);
            }
        });
    }

    private getVertexLabel(vertex: Vertex): Option<Label> {
        return LRoomLabel.getIcon(ICON_FOR_VERTEX_TAG, vertex.getTags())
            .map(icon => new IconLabel(this.logger, vertex.getLocation().getXY(), icon, false));
    }
}

export type ClickListener = (e: LeafletMouseEvent) => void;
