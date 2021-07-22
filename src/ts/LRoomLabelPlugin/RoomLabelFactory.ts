import { MapController } from "../Map/Controller/MapController";
import { Logger } from "../Map/View/Sidebar/LogPane/LogPane";
import { MapData } from "../MapData";
import { TextMeasurer } from "../TextMeasurer";
import { ISettings } from "../settings/ISettings";
import { RoomLabel, RoomLabelLayerOptions } from "./RoomLabel";

export class RoomLabelFactory {
    public static inject = [
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
