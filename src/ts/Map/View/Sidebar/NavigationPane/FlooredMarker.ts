import { Marker, MarkerOptions } from "leaflet";

import { BuildingLocation } from "../../../../BuildingLocation/BuildingLocation";
import { LSomeLayerWithFloor } from "../../../../LFloorsPlugin/LFloorsPlugin";

export function flooredMarker(
    position: BuildingLocation,
    options?: MarkerOptions | undefined,
): FlooredMarker {
    return new FlooredMarker(position, options);
}

export class FlooredMarker extends Marker implements LSomeLayerWithFloor {
    private floorNumber: string;

    constructor(
        position: BuildingLocation,
        options?: MarkerOptions | undefined,
    ) {
        super(position.getXY(), options);
        this.floorNumber = position.getFloor();
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }

    public setLocation(location: BuildingLocation): void {
        this.setLatLng(location.getXY());
        this.floorNumber = location.getFloor();
    }

    public getLocation(): BuildingLocation {
        return new BuildingLocation(this.getLatLng(), this.getFloorNumber());
    }
}
