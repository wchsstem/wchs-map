import { IGeocoderDefinition } from "../../Geocoder/IGeocoderDefinition";
import { None, Option } from "@nvarner/monads";
import { IMapModel } from "./IMapModel";

export class LeafletMapModel implements IMapModel {
    public navigateFrom: Option<IGeocoderDefinition>;
    public navigateTo: Option<IGeocoderDefinition>;

    static inject = [] as const;
    public constructor() {
        this.navigateFrom = None;
        this.navigateTo = None;
    }
}
