import { LFloors, LSomeLayerWithFloor } from "./LFloorsPlugin/LFloorsPlugin";
import { ISettings } from "./settings/ISettings";
import { None, Option, Result, Some } from "@nvarner/monads";
import { popup, Map as LMap, Popup, LeafletMouseEvent } from "leaflet";
import { extractResult, goRes } from "./utils";
import { MapData } from "./MapData";
import { Logger } from "./LogPane/LogPane";

/** Lazily sets up dev mode when enabled. Displays vertices, edges, and mouse click location. */
export class DeveloperModeService {
    private readonly showClickLoc: (e: LeafletMouseEvent) => void;

    private readonly locationPopup: Popup;
    private devLayers: Option<LSomeLayerWithFloor[]>;

    static inject = ["settings", "map", "mapData", "floors", "logger"] as const;
    public constructor(
        settings: ISettings,
        private readonly map: LMap,
        private readonly mapData: MapData,
        private readonly floors: LFloors,
        private readonly logger: Logger,
    ) {
        this.showClickLoc = (e) =>
            this.locationPopup
                .setLatLng(e.latlng)
                .setContent(`${e.latlng.lng}, ${e.latlng.lat}`)
                .openOn(this.map);

        this.locationPopup = popup();
        this.devLayers = None;

        settings.addWatcher("dev", (devUnknown) => {
            const dev = devUnknown as boolean;
            this.onDevSettingChange(dev);
        });
    }

    private onDevSettingChange(dev: boolean) {
        if (dev) {
            this.onEnableDevSetting();
        } else {
            this.onDisableDevSetting();
        }
    }

    private onEnableDevSetting() {
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

    private onDisableDevSetting() {
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
