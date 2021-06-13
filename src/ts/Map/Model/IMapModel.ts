import { Option } from "@nvarner/monads";

import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";

export interface IMapModel {
    navigateFrom: Option<GeocoderDefinition>;
    navigateTo: Option<GeocoderDefinition>;
}
