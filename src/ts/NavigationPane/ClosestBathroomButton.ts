import { BuildingLocation } from "../BuildingLocation";
import { Geocoder, GeocoderDefinition } from "../Geocoder";
import { LFloors } from "../LFloorsPlugin/LFloorsPlugin";
import { Locator } from "../Locator";
import MapData from "../MapData";
import { settings } from "../settings";
import { ClosestDefinitionButton } from "./ClosestDefinitionButton";

export class ClosestBathroomButton extends ClosestDefinitionButton {
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
            definition => {
                if (definition.hasTag("closed"))
                    return false;

                const gender = settings.getData("bathroom-gender").unwrap();
                if (gender === "m")
                    return definition.hasTag("men-bathroom");
                else if (gender === "w")
                    return definition.hasTag("women-bathroom");
                else
                    return definition.hasTag("men-bathroom") || definition.hasTag("women-bathroom");
            },
            "fas fa-restroom",
            "Nearest Restroom",
            onGetClosest,
        );
    }
}