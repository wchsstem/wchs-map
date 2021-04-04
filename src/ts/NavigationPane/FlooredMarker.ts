import { Marker, MarkerOptions } from "leaflet";
import { LSomeLayerWithFloor } from "../LFloorsPlugin/LFloorsPlugin";
import { BuildingLocation } from "../BuildingLocation";

export function flooredMarker(position: BuildingLocation, options?: MarkerOptions | undefined): FlooredMarker {
    return new FlooredMarker(position, options);
}

export class FlooredMarker extends Marker implements LSomeLayerWithFloor {
    private readonly floorNumber: string;

    constructor(position: BuildingLocation, options?: MarkerOptions | undefined) {
        super(position.getXY(), options);
        this.floorNumber = position.getFloor();
    }

    getFloorNumber(): string {
        return this.floorNumber;
    }
}