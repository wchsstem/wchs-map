import * as L from "leaflet";

import { LLocationControl } from "./LLocationControl";
import { settings, Watcher } from "../ts/settings";
import { None, Option, Some } from "monads";

export class LLocation extends L.LayerGroup {
    private control: LLocationControl;

    private positionState: PositionState;
    private latestPosition: Option<[number, number]>;
    private latestAccuracyRadius: Option<number>;

    private hidingLocation: boolean;
    private positionMarker: Option<PositionMarker>;

    private map: Option<L.Map>;

    /**
     * Creates a new layer that shows the user's location on the map.
     * @param options Any extra Leaflet layer options
     */
    constructor(options?: L.LayerOptions) {
        if (options && !("attribution" in options)) {
            options["attribution"] = "© OpenStreetMap contributors";
        }

        super([], options);

        this.control = new LLocationControl(() => { this.locate() }, { position: "topright" });

        this.positionState = PositionState.Unknown;
        this.latestPosition = None;
        this.latestAccuracyRadius = None;

        this.positionMarker = None;
        this.map = None;
        
        this.hidingLocation = false;
        settings.addWatcher("hiding-location", new Watcher((hidingLocation: boolean) => {
            this.onChangeHidingLocation(hidingLocation);
        }));

        const onPositionUpdate = (latestPosition: Position) => {
            this.onPositionUpdate(latestPosition);
        };
        const onPositionError = (error: PositionError) => {
            this.onPositionError(error);
        };

        // Get the rough current position once so we have a decent idea of the current location, but request a good
        // location to be updated as often as possible.
        navigator.geolocation.getCurrentPosition(onPositionUpdate, onPositionError);
        navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
            enableHighAccuracy: true
        });
    }

    onAdd(map: L.Map): this {
        super.onAdd(map);
        this.control.addTo(map);
        this.map = Some(map);

        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);
        map.removeControl(this.control);
        return this;
    }

    private locate(): void {
        this.latestPosition.ifSome(position => {
            this.map.ifSome(map => {
                map.flyTo([position[1], position[0]], 2.5);
            });
        });
    }

    private onPositionUpdate(latestPosition: Position): void {
        const coords = latestPosition.coords;

        if (LLocation.latLongNearChurchill(coords.latitude, coords.longitude)) {
            this.setPositionStateNearChurchill(coords);
        } else {
            this.setPositionStateNotNearChurchill();
        }
    }

    private onPositionError(error: PositionError): void {
        this.setPositionStateUnknown();
    }

    private setPositionStateNearChurchill(coords: Coordinates): void {
        this.positionState = PositionState.NearChurchill;

        const latestAccuracyRadius = LLocation.metersToFeet(coords.accuracy);
        const latestPosition = LLocation.latLongToChurchillSpace(coords.latitude, coords.longitude);

        this.latestAccuracyRadius = Some(latestAccuracyRadius);
        this.latestPosition = Some(latestPosition);

        this.positionMarker.ifSome(positionMarker => super.removeLayer(positionMarker));
        const positionMarker = new PositionMarker(latestPosition, latestAccuracyRadius);
        this.positionMarker = Some(positionMarker);
        if (!this.hidingLocation) {
            super.addLayer(positionMarker);
        }

        // When near Churchill, location is available
        this.control.onLocationAvailable();
    }

    private setPositionStateNotNearChurchill(): void {
        // TODO: Switch to lower accuracy GPS readings
        this.positionState = PositionState.NotNearChurchill;

        this.positionMarker.ifSome(positionMarker => super.removeLayer(positionMarker));

        // When not near Churchill, location is not available
        this.control.onLocationNotAvailable();
    }

    private setPositionStateUnknown(): void {
        this.positionState = PositionState.Unknown;

        this.positionMarker.ifSome(positionMarker => super.removeLayer(positionMarker));

        this.control.onLocationNotAvailable();
    }

    private onChangeHidingLocation(hidingLocation: boolean): void {
        this.hidingLocation = hidingLocation;
        
        this.positionMarker.ifSome(positionMarker => {
            if (this.positionState == PositionState.NearChurchill) {
                if (this.hidingLocation) {
                    super.removeLayer(positionMarker);
                } else {
                    super.addLayer(positionMarker);
                }
            }
        });
    }

    private static latLongToChurchillSpace(latitude: number, longitude: number): [number, number] {
        // Churchill (214, 137.125) becomes (-77.17316, 39.04371) long-lat
        // (408.625, 145.5) -> (-77.17260, 39.04409)
        // (466, 271.25) -> (-77.17277, 39.04453)

        // Affine transformation matrix from long-lat to Churchill coords:
        // 63832500/311  65216250/311 190395034993/24880
        // -44100000/311 71843750/311 -99333444007/4976
        // 0             0            1

        // Calculated based on https://brilliant.org/wiki/affine-transformations/

        const x = (63832500.0/311.0) * longitude + (65216250/311) * latitude + (190395034993/24880);
        const y = (-44100000/311) * longitude + (71843750/311) * latitude + (-99333444007/4976);
        return [x, y];
    }

    /**
     * Determines if a lat-long coordinate is near Churchill. Any point within Churchill's campus (school building,
     * parking lots, fields, etc.) should be near Churchill. Points that are physically close to Churchill may be
     * considered near. Points far from Churchill should never be considered near.
     */
    private static latLongNearChurchill(latitude: number, longitude: number): boolean {
        // Bounding box completely containing Churchill and school grounds
        const latMax = 39.04569;
        const latMin = 39.04068;
        const longMax = -77.17082;
        const longMin = -77.17723;
        return latMax >= latitude && latitude >= latMin && longMax >= longitude && longitude >= longMin;
    }

    private static metersToFeet(meters: number): number {
        return meters * 3.28084;
    }
}

enum PositionState {
    Unknown,
    NearChurchill,
    NotNearChurchill
}

class PositionMarker extends L.LayerGroup {
    constructor(position: [number, number], accuracyRadius: number) {
        const positionLeaflet = new L.LatLng(position[1], position[0]);

        const positionPoint = L.circleMarker(positionLeaflet, { radius: 1 });
        const accuracyCircle = L.circle(positionLeaflet, {
            stroke: false,
            radius: accuracyRadius,
        });

        super([positionPoint, accuracyCircle]);
    }
}
