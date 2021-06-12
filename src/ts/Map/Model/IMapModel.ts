import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { Option } from "@nvarner/monads";

export interface IMapModel {
    navigateFrom: Option<GeocoderDefinition>;
    navigateTo: Option<GeocoderDefinition>;
}
