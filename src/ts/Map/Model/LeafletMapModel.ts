import { None, Option } from "@nvarner/monads";

import { GeocoderDefinition } from "../../Geocoder/GeocoderDefinition";
import { IMapModel } from "./IMapModel";

export class LeafletMapModel implements IMapModel {
    public navigateFrom: Option<GeocoderDefinition>;
    public navigateTo: Option<GeocoderDefinition>;

    static inject = [] as const;
    public constructor() {
        this.navigateFrom = None;
        this.navigateTo = None;
    }
}
