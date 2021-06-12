import { BuildingLocation } from "../../../../BuildingLocation/BuildingLocation";
import { DefinitionTag } from "../../../../Geocoder/DefinitionTag";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { GeocoderDefinition } from "../../../../Geocoder/GeocoderDefinition";
import { LFloors } from "../../../../LFloorsPlugin/LFloorsPlugin";
import { Locator } from "../../../../Locator";
import { MapData } from "../../../../MapData";
import { ISettings } from "../../../../settings/ISettings";
import { ClosestDefinitionButton } from "./ClosestDefinitionButton";

export class ClosestBathroomButton extends ClosestDefinitionButton {
    public constructor(
        geocoder: Geocoder,
        locator: Locator,
        settings: ISettings,
        mapData: MapData,
        floorsLayer: LFloors,
        onGetClosest: (
            closest: GeocoderDefinition,
            starting: BuildingLocation,
        ) => void,
    ) {
        super(
            geocoder,
            locator,
            mapData,
            floorsLayer,
            (definition) => {
                if (definition.hasTag(DefinitionTag.Closed)) return false;

                const gender = settings.getData("bathroom-gender").unwrap();
                if (gender === "m") {
                    return definition.hasTag(DefinitionTag.MenBathroom);
                } else if (gender === "w") {
                    return definition.hasTag(DefinitionTag.WomenBathroom);
                } else {
                    return (
                        definition.hasTag(DefinitionTag.MenBathroom) ||
                        definition.hasTag(DefinitionTag.WomenBathroom)
                    );
                }
            },
            "fas fa-restroom",
            "Nearest Restroom",
            onGetClosest,
        );
    }
}
