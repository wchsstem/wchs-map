import { LatLng } from "leaflet";

import { Option, Some, None } from "@nvarner/monads";

export class BuildingLocation {
    public constructor(
        private readonly xy: LatLng,
        private readonly floor: string,
    ) {}

    public getXY(): LatLng {
        return this.xy;
    }

    public getFloor(): string {
        return this.floor;
    }

    public distanceTo(other: BuildingLocation): Option<number> {
        if (this.floor === other.floor) {
            const dlat = other.xy.lat - this.xy.lat;
            const dlng = other.xy.lng - this.xy.lng;
            return Some(Math.sqrt(dlat * dlat + dlng * dlng));
        } else {
            return None;
        }
    }

    public distance2To(other: BuildingLocation): Option<number> {
        if (this.floor === other.floor) {
            const dlat = other.xy.lat - this.xy.lat;
            const dlng = other.xy.lng - this.xy.lng;
            return Some(dlat * dlat + dlng * dlng);
        } else {
            return None;
        }
    }
}
