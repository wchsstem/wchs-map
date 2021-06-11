import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { IMapModel } from "../Model/IMapModel";
import { MapView } from "../View/MapView";
import { IMapController } from "./IMapController";
import { Option, Some } from "@nvarner/monads";
import { BuildingLocationWithEntrances } from "../../BuildingLocation/BuildingLocationWithEntrances";
import { LocationOnlyDefinition } from "../../LocationOnlyDefinition";
import { MapData } from "../../MapData";
import { Logger } from "../../LogPane/LogPane";
import { Geocoder } from "../../Geocoder/Geocoder";
import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";
import { Events } from "../../events/Events";

export class LeafletMapController implements IMapController {
    static inject = ["mapView", "mapModel", "mapData", "geocoder", "logger", "events"] as const;
    public constructor(
        private readonly view: MapView,
        private readonly model: IMapModel,
        private readonly mapData: MapData,
        geocoder: Geocoder,
        private readonly logger: Logger,
        events: Events
    ) {
        events.on("clickResult", result => {
            geocoder.getDefinitionFromName(result.name)
                .ifSome(definition => view.focusOnDefinition(definition));
        });

        events.on("clickClosestButton", (closest, starting) => {
            const entranceLocation = new BuildingLocationWithEntrances(starting, []);
            const startingDefinition = new LocationOnlyDefinition(entranceLocation);
            this.navigateFrom(Some(startingDefinition));
            this.view.focusOnDefinition(closest);
        });

        events.on("swapNav", () => this.swapNav());

        events.on("clickNavigateFromSuggestion", suggestion => {
            const definition = geocoder.getDefinitionFromName(suggestion.name).unwrap();
            this.navigateFrom(Some(definition));
            this.view.clearNavSuggestions();
        });

        events.on("clickNavigateToSuggestion", suggestion => {
            const definition = geocoder.getDefinitionFromName(suggestion.name).unwrap();
            this.navigateTo(Some(definition));
            this.view.clearNavSuggestions();
        });

        events.on("moveToPin", location => {
            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
            this.navigateTo(definition);
        });

        events.on("moveFromPin", location => {
            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
            this.navigateFrom(definition);
        });

        view.setSnapPinHandler(location => {
            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
            return definition.map<BuildingLocation>(definition => definition.getLocation()).unwrapOr(location);
        });
    }

    public focusOnDefinition(definition: GeocoderDefinition): void {
        this.view.focusOnDefinition(definition);
    }

    private calcNav(from: GeocoderDefinition, to: GeocoderDefinition): void {
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

    public navigateFrom(definition: Option<GeocoderDefinition>): void {
        this.model.navigateFrom = definition;
        this.calcNavIfNeeded();
    }

    public navigateTo(definition: Option<GeocoderDefinition>): void {
        this.model.navigateTo = definition;
        this.calcNavIfNeeded();
    }

    private swapNav(): void {
        const from = this.model.navigateFrom;
        this.navigateFrom(this.model.navigateTo);
        this.navigateTo(from);
    }
}