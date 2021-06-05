import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { Option } from "@nvarner/monads";

export interface IMapModel {
    navigateFrom: Option<IGeocoderDefinition>;
    navigateTo: Option<IGeocoderDefinition>;
}
