import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { IMapModel } from "../Model/IMapModel";
import { IMapView } from "../View/IMapView";
import { IMapController } from "./IMapController";
import { Option, Some } from "@nvarner/monads";
import { BuildingLocationWithEntrances } from "../../BuildingLocation/BuildingLocationWithEntrances";
import { LocationOnlyDefinition } from "../../LocationOnlyDefinition";
import { MapData } from "../../MapData";
import { Logger } from "../../LogPane/LogPane";
import { Geocoder } from "../../Geocoder/Geocoder";
import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";

export class LeafletMapController implements IMapController {
    static inject = ["mapView", "mapModel", "mapData", "geocoder", "logger"] as const;
    public constructor(
        private readonly view: IMapView,
        private readonly model: IMapModel,
        private readonly mapData: MapData,
        private readonly geocoder: Geocoder,
        private readonly logger: Logger
    ) {
        view.registerOnClickClosest((closest, starting) => {
            const entranceLocation = new BuildingLocationWithEntrances(starting, []);
            const startingDefinition = new LocationOnlyDefinition(entranceLocation);
            this.navigateFrom(Some(startingDefinition));
            this.view.focusOnDefinition(closest);
        });

        view.registerOnSwapNav(() => this.swapNav());

        view.registerOnNavigateTo(definition => this.navigateTo(definition));

        view.registerOnNavigateFrom(definition => this.navigateFrom(definition));

        view.registerOnMoveToPin(location => {
            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
            this.navigateTo(definition);
        });

        view.registerOnMoveFromPin(location => {
            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
            this.navigateFrom(definition);
        });

        view.setSnapPinHandler(location => {
            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
            return definition.map<BuildingLocation>(definition => definition.getLocation()).unwrapOr(location);
        });
    }

    public focusOnDefinition(definition: IGeocoderDefinition): void {
        this.view.focusOnDefinition(definition);
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

    private calcNavIfNeeded(): void {
        this.model.navigateFrom.ifSome(from => this.model.navigateTo.ifSome(to => this.calcNav(from, to)));
    }

    public navigateFrom(definition: Option<IGeocoderDefinition>): void {
        this.model.navigateFrom = definition;
        this.calcNavIfNeeded();
    }

    public navigateTo(definition: Option<IGeocoderDefinition>): void {
        this.model.navigateTo = definition;
        this.calcNavIfNeeded();
    }

    private swapNav(): void {
        const from = this.model.navigateFrom;
        this.navigateFrom(this.model.navigateTo);
        this.navigateTo(from);
    }
}