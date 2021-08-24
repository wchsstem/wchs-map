import { popup, Map as LMap, Popup, LeafletMouseEvent, LatLng } from "leaflet";

import { None, Option, Result, Some } from "@nvarner/monads";

import { LFloors, LSomeLayerWithFloor } from "./LFloorsPlugin/LFloorsPlugin";
import { Logger } from "./Map/View/Sidebar/LogPane/LogPane";
import { MapData } from "./MapData";
import { ISettings } from "./settings/ISettings";
import { extractResult, goRes } from "./utils";

/** Lazily sets up dev mode when enabled. Displays vertices, edges, and mouse click location. */
export class DeveloperModeService {
    private readonly showClickLoc: (e: LeafletMouseEvent) => void;

    private readonly locationPopup: Popup;
    private devLayers: Option<LSomeLayerWithFloor[]>;

    public static inject = [
        "settings",
        "map",
        "mapData",
        "floors",
        "logger",
    ] as const;
    public constructor(
        settings: ISettings,
        private readonly map: LMap,
        private readonly mapData: MapData,
        private readonly floors: LFloors,
        private readonly logger: Logger,
    ) {
        this.showClickLoc = (e) => {
            const link = this.getLink(e.latlng, floors);
            this.locationPopup
                .setLatLng(e.latlng)
                .setContent(
                    `<div>
                        <p>
                            ${e.latlng.lng}, ${e.latlng.lat}
                        </p>
                        <p>
                            <a href=${link}>${link}</a>
                        </p>
                    </div>`,
                )
                .openOn(this.map);
        };

        this.locationPopup = popup();
        this.devLayers = None;

        settings.addWatcher("dev", (devUnknown) => {
            const dev = devUnknown as boolean;
            this.onDevSettingChange(dev);
        });
    }

    private getLink(latlng: LatLng, floors: LFloors): string {
        const x = Math.round(latlng.lng);
        const y = Math.round(latlng.lat);
        const floor = floors.getCurrentFloor();
        return `/#/loc:(${x},${y},${floor})`;
    }

    private onDevSettingChange(dev: boolean): void {
        if (dev) {
            this.onEnableDevSetting();
        } else {
            this.onDisableDevSetting();
        }
    }

    private onEnableDevSetting(): void {
        if (this.devLayers.isNone()) {
            const layersErr = goRes(this.createDevLayers());
            if (layersErr[1] !== null) {
                this.logger.logError(
                    `Error creating dev layers: ${layersErr[1]}`,
                );
                return;
            }
            this.devLayers = Some(layersErr[0]);
        }
        this.devLayers
            .unwrap()
            .forEach((devLayer) => this.floors.addLayer(devLayer));
        this.map.on("click", this.showClickLoc, this);
    }

    private onDisableDevSetting(): void {
        this.devLayers.ifSome((devLayers) =>
            devLayers.forEach((devLayer) => this.floors.removeLayer(devLayer)),
        );
        this.map.off("click", this.showClickLoc, this);
    }

    private createDevLayers(): Result<LSomeLayerWithFloor[], string> {
        return extractResult(
            this.mapData
                .getAllFloors()
                .map((floorData) => floorData.number)
                .map((floorNumber) =>
                    this.mapData.createDevLayerGroup(floorNumber),
                ),
        );
    }
}
