import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { Option } from "@nvarner/monads";
import { Geocoder } from "../../Geocoder/Geocoder";

export interface IMapModel {
    navigateFrom: Option<IGeocoderDefinition>;
    navigateTo: Option<IGeocoderDefinition>;
}
