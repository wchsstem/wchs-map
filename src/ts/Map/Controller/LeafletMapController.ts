import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { IMapModel } from "../Model/IMapModel";
import { IMapView } from "../View/IMapView";
import { IMapController } from "./IMapController";
import { Option, Some } from "@nvarner/monads";
import { BuildingLocationWithEntrances } from "../../BuildingLocation/BuildingLocationWithEntrances";
import { LocationOnlyDefinition } from "../../LocationOnlyDefinition";
import { MapData } from "../../MapData";
import { Logger } from "../../LogPane/LogPane";

export class LeafletMapController implements IMapController {
    static inject = ["mapView", "mapModel", "mapData", "logger"] as const;
    public constructor(
        private readonly view: IMapView,
        private readonly model: IMapModel,
        private readonly mapData: MapData,
        private readonly logger: Logger
    ) {
        view.registerOnClickClosest((closest, starting) => {
            const entranceLocation = new BuildingLocationWithEntrances(starting, []);
            const startingDefinition = new LocationOnlyDefinition(entranceLocation);
            this.navigateFrom(Some(startingDefinition));
            this.view.focusOnDefinition(closest);
        });
    }

    public focusOnDefinition(definition: IGeocoderDefinition): void {
        this.view.focusOnDefinition(definition);
    }

    private calcNavIfNeeded(): void {
        this.model.navigateFrom.ifSome(from => this.model.navigateTo.ifSome(to => this.calcNav(from, to)));
    }

    private calcNav(from: IGeocoderDefinition, to: IGeocoderDefinition): void {
        this.view.clearNav();
        const path = this.mapData.findBestPath(from, to);
        path.ifSome(path => {
            const resPathLayers = this.mapData.createLayerGroupsFromPath(path);
            resPathLayers.match({
                ok: pathLayers => this.view.displayNav(pathLayers),
                err: error => this.logger.logError(`Error in NavigationPane.calcNav: ${error}`)
            });
        });
    }

    public navigateFrom(definition: Option<IGeocoderDefinition>): void {
        this.model.navigateFrom = definition;
        this.calcNavIfNeeded();
    }

    public navigateTo(definition: Option<IGeocoderDefinition>): void {
        this.model.navigateTo = definition;
        this.calcNavIfNeeded();
    }
}