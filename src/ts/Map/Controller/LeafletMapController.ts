import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { IMapModel } from "../Model/IMapModel";
import { MapView } from "../View/MapView";
import { MapController } from "./MapController";
import { Option, Some } from "@nvarner/monads";
import { BuildingLocationWithEntrances } from "../../BuildingLocation/BuildingLocationWithEntrances";
import { LocationOnlyDefinition } from "../../LocationOnlyDefinition";
import { MapData } from "../../MapData";
import { Logger } from "../../LogPane/LogPane";
import { Geocoder } from "../../Geocoder/Geocoder";
import { BuildingLocation } from "../../BuildingLocation/BuildingLocation";
import { Events } from "../../events/Events";

export class LeafletMapController implements MapController {
    static inject = [
        "mapView",
        "mapModel",
        "mapData",
        "geocoder",
        "logger",
        "events",
    ] as const;
    public constructor(
        private readonly view: MapView,
        private readonly model: IMapModel,
        private readonly mapData: MapData,
        geocoder: Geocoder,
        private readonly logger: Logger,
        events: Events,
    ) {
        events.on("clickResult", (result) => {
            geocoder
                .getDefinitionFromName(result.name)
                .ifSome((definition) => view.focusOnDefinition(definition));
        });

        events.on("clickClosestButton", (closest, starting) => {
            const entranceLocation = new BuildingLocationWithEntrances(
                starting,
                [],
            );
            const startingDefinition = new LocationOnlyDefinition(
                entranceLocation,
            );
            this.navigateFrom(Some(startingDefinition), true);
            this.view.focusOnDefinition(closest);
        });

        events.on("swapNav", () => {
            const from = this.model.navigateFrom;
            this.navigateFrom(this.model.navigateTo, true);
            this.navigateTo(from, true);
        });

        events.on("clickNavigateFromSuggestion", (suggestion) => {
            const definition = geocoder
                .getDefinitionFromName(suggestion.name)
                .unwrap();
            this.navigateFrom(Some(definition), true);
        });

        events.on("clickNavigateToSuggestion", (suggestion) => {
            const definition = geocoder
                .getDefinitionFromName(suggestion.name)
                .unwrap();
            this.navigateTo(Some(definition), true);
        });

        events.on("clickClosestButton", (closestDefinition, starting) => {
            geocoder
                .getClosestDefinition(
                    new BuildingLocationWithEntrances(starting, []),
                )
                .ifSome((startingDefinition) => {
                    this.navigateFrom(Some(startingDefinition), true);
                    this.navigateTo(Some(closestDefinition), true);
                });
        });

        events.on("dragToPin", (location) => {
            const definition = geocoder.getClosestDefinition(
                new BuildingLocationWithEntrances(location, []),
            );
            this.navigateTo(definition, false);
        });

        events.on("dragFromPin", (location) => {
            const definition = geocoder.getClosestDefinition(
                new BuildingLocationWithEntrances(location, []),
            );
            this.navigateFrom(definition, false);
        });

        events.on("clickNavigateToDefinitionButton", (definition) => {
            this.navigateTo(Some(definition), true);
        });

        events.on("clickFocusDefinitionButton", (definition) => {
            this.focusOnDefinition(definition);
        });

        view.setSnapPinHandler((location) => {
            const definition = geocoder.getClosestDefinition(
                new BuildingLocationWithEntrances(location, []),
            );
            return definition
                .map<BuildingLocation>((definition) => definition.getLocation())
                .unwrapOr(location);
        });
    }

    public moveFromPin(location: BuildingLocation): void {
        this.view.moveFromPin(location);
    }

    public moveToPin(location: BuildingLocation): void {
        this.view.moveToPin(location);
    }

    public focusOnDefinition(definition: GeocoderDefinition): void {
        this.view.focusOnDefinition(definition);
    }

    private calcNav(from: GeocoderDefinition, to: GeocoderDefinition): void {
        this.view.clearNav();
        const path = this.mapData.findBestPath(from, to);
        path.ifSome((path) => {
            const resPathLayers = this.mapData.createLayerGroupsFromPath(path);
            resPathLayers.match({
                ok: (pathLayers) => this.view.displayNav(pathLayers),
                err: (error) =>
                    this.logger.logError(
                        `Error in NavigationPane.calcNav: ${error}`,
                    ),
            });
        });
    }

    private calcNavIfNeeded(): void {
        this.model.navigateFrom.ifSome((from) =>
            this.model.navigateTo.ifSome((to) => this.calcNav(from, to)),
        );
    }

    public navigateFrom(
        definition: Option<GeocoderDefinition>,
        movePin: boolean,
    ): void {
        this.model.navigateFrom = definition;
        definition.ifSome((definition) => {
            if (movePin) {
                this.moveFromPin(definition.getLocation());
            }
            this.view.setNavigateFromInputContents(definition.getName());
        });
        this.calcNavIfNeeded();
    }

    public navigateTo(
        definition: Option<GeocoderDefinition>,
        movePin: boolean,
    ): void {
        this.model.navigateTo = definition;
        definition.ifSome((definition) => {
            if (movePin) {
                this.moveToPin(definition.getLocation());
            }
            this.view.setNavigateToInputContents(definition.getName());
        });
        this.view.clearNavSuggestions();
        this.calcNavIfNeeded();
    }
}
