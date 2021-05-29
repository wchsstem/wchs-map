import { BuildingLocation, BuildingLocationWithEntrances } from "../../BuildingLocation";
import { Geocoder, GeocoderDefinition } from "../../Geocoder";
import { h } from "../../JSX";
import { LFloors } from "../../LFloorsPlugin/LFloorsPlugin";
import { LocationOnlyDefinition } from "../../LocationOnlyDefinition";
import { Locator } from "../../Locator";
import { MapData } from "../../MapData";

export class ClosestDefinitionButton {
    private readonly geocoder: Geocoder;
    private readonly locator: Locator;
    private readonly mapData: MapData;
    private readonly floorsLayer: LFloors;
    private readonly predicate: (definition: GeocoderDefinition) => boolean;

    private readonly iconClass: string;
    private readonly titleText: string;
    private readonly onGetClosest: (closest: GeocoderDefinition, starting: BuildingLocation) => void;

    public constructor(
        geocoder: Geocoder,
        locator: Locator,
        mapData: MapData,
        floorsLayer: LFloors,
        predicate: (definition: GeocoderDefinition) => boolean,
        iconClass: string,
        titleText: string,
        onGetClosest: (closest: GeocoderDefinition, starting: BuildingLocation) => void,
    ) {
        this.geocoder = geocoder;
        this.locator = locator;
        this.mapData = mapData;
        this.floorsLayer = floorsLayer;
        this.predicate = predicate;
        this.iconClass = iconClass;
        this.titleText = titleText;
        this.onGetClosest = onGetClosest;
    }

    public getHtml(): HTMLElement {
        return <a href="#" class="leaflet-style button" onClick={() => this.handleClick()} title={this.titleText}>
            <i class={this.iconClass}></i>
        </a>;
    }

    private handleClick() {
        if (this.locator.isNearChurchill()) {
            this.locator.getLatestPosition().ifSome(position => {
                const starting = new BuildingLocation(position, this.floorsLayer.getCurrentFloor());
                const closestOptional = this.geocoder.getClosestDefinitionToFilteredWithDistance(
                    new BuildingLocationWithEntrances(starting, []),
                    this.predicate,
                    (from, to) => {
                        const fromDef = new LocationOnlyDefinition(from);
                        const toDef = new LocationOnlyDefinition(to);
                        return this.mapData.findBestPathLength(fromDef, toDef);
                    }
                );
                closestOptional.ifSome(closest => this.onGetClosest(closest, starting));
            });
        }
    }
}