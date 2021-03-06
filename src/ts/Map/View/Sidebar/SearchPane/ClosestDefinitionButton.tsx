import { BuildingLocation } from "../../../../BuildingLocation/BuildingLocation";
import { BuildingLocationWithEntrances } from "../../../../BuildingLocation/BuildingLocationWithEntrances";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { GeocoderDefinition } from "../../../../Geocoder/GeocoderDefinition";
import { h } from "../../../../JSX";
import { LFloors } from "../../../../LFloorsPlugin/LFloorsPlugin";
import { LocationOnlyDefinition } from "../../../../LocationOnlyDefinition";
import { Locator } from "../../../../Locator";
import { MapData } from "../../../../MapData";

export class ClosestDefinitionButton {
    public constructor(
        private readonly geocoder: Geocoder,
        private readonly locator: Locator,
        private readonly mapData: MapData,
        private readonly floorsLayer: LFloors,
        private readonly predicate: (definition: GeocoderDefinition) => boolean,
        private readonly iconClass: string,
        private readonly titleText: string,
        private readonly onGetClosest: (
            closest: GeocoderDefinition,
            starting: BuildingLocation,
        ) => void,
    ) {}

    public getHtml(): HTMLElement {
        return (
            <a
                href="#"
                className="leaflet-style button"
                onclick={() => this.handleClick()}
                title={this.titleText}
            >
                <i className={this.iconClass} />
            </a>
        );
    }

    private handleClick(): void {
        if (this.locator.isNearChurchill()) {
            this.locator.getLatestPosition().ifSome((position) => {
                const starting = new BuildingLocation(
                    position,
                    this.floorsLayer.getCurrentFloor(),
                );
                const closestOptional =
                    this.geocoder.getClosestDefinitionToFilteredWithDistance(
                        new BuildingLocationWithEntrances(starting, []),
                        this.predicate,
                        (from, to) => {
                            const fromDef = new LocationOnlyDefinition(from);
                            const toDef = new LocationOnlyDefinition(to);
                            return this.mapData.findBestPathLength(
                                fromDef,
                                toDef,
                            );
                        },
                    );
                closestOptional.ifSome((closest) =>
                    this.onGetClosest(closest, starting),
                );
            });
        }
    }
}
