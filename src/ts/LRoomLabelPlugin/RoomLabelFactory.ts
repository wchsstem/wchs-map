import { Logger } from "../LogPane/LogPane";
import { MapData } from "../MapData";
import { ISettings } from "../settings/ISettings";
import { Sidebar } from "../Sidebar/SidebarController";
import { TextMeasurer } from "../TextMeasurer";
import { RoomLabel, RoomLabelLayerOptions } from "./RoomLabel";

export class RoomLabelFactory {
    private readonly mapData: MapData;
    private readonly sidebar: Sidebar;
    private readonly settings: ISettings;
    private readonly logger: Logger;
    private readonly textMeasurer: TextMeasurer;
    
    static inject = ["mapData", "sidebar", "settings", "logger", "textMeasurer"] as const;
    public constructor(
        mapData: MapData,
        sidebar: Sidebar,
        settings: ISettings,
        logger: Logger,
        textMeasurer: TextMeasurer
    ) {
        this.mapData = mapData;
        this.sidebar = sidebar;
        this.settings = settings;
        this.logger = logger;
        this.textMeasurer = textMeasurer;
    }

    public build(floorNumber: string, options: RoomLabelLayerOptions): RoomLabel {
        return new RoomLabel(
            this.mapData,
            this.sidebar,
            this.settings,
            this.logger,
            this.textMeasurer,
            floorNumber,
            options
        );
    }
}