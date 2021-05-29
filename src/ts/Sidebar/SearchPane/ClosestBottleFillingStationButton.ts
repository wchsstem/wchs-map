import { BuildingLocation } from "../../BuildingLocation";
import { Geocoder, GeocoderDefinition } from "../../Geocoder";
import { LFloors } from "../../LFloorsPlugin/LFloorsPlugin";
import { Locator } from "../../Locator";
import { MapData } from "../../MapData";
import { ClosestDefinitionButton } from "./ClosestDefinitionButton";

export class ClosestBottleFillingStationButton extends ClosestDefinitionButton {
    public constructor(
        geocoder: Geocoder,
        locator: Locator,
        mapData: MapData,
        floorsLayer: LFloors,
        onGetClosest: (closest: GeocoderDefinition, starting: BuildingLocation) => void
    ) {
        super(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            definition => !definition.hasTag("closed") && definition.hasTag("wf"),
            "fas fa-tint",
            "Nearest Bottle Filling Station",
            onGetClosest,
        );
    }
}