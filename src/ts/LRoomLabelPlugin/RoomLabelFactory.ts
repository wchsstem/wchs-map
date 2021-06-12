import { Logger } from "../LogPane/LogPane";
import { MapData } from "../MapData";
import { ISettings } from "../settings/ISettings";
import { TextMeasurer } from "../TextMeasurer";
import { RoomLabel, RoomLabelLayerOptions } from "./RoomLabel";
import { MapController } from "../Map/Controller/MapController";

export class RoomLabelFactory {
    static inject = [
        "mapData",
        "mapController",
        "settings",
        "logger",
        "textMeasurer",
    ] as const;
    public constructor(
        private readonly mapData: MapData,
        private readonly mapController: MapController,
        private readonly settings: ISettings,
        private readonly logger: Logger,
        private readonly textMeasurer: TextMeasurer,
    ) {}

    public build(
        floorNumber: string,
        options: RoomLabelLayerOptions,
    ): RoomLabel {
        return new RoomLabel(
            this.mapData,
            this.mapController,
            this.settings,
            this.logger,
            this.textMeasurer,
            floorNumber,
            options,
        );
    }
}
