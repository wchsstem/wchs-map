import * as L from "leaflet";

import { LLocationControl } from "./LLocationControl";
import { settings, Watcher } from "../settings";
import { None, Option, Some } from "@nvarner/monads";
import { Logger } from "../LogPane/LogPane";

const SENSITIVITY = 10;

export class LLocation extends L.LayerGroup {
    private readonly logger: Logger;

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
    constructor(logger: Logger, options?: L.LayerOptions) {
        if (options && !("attribution" in options)) {
            options["attribution"] = "© OpenStreetMap contributors";
        }

        super([], options);

        this.logger = logger;

        this.control = new LLocationControl(() => { this.locate() }, { position: "topright" });

        this.positionState = PositionState.Unknown;
        this.latestPosition = None;
        this.latestAccuracyRadius = None;

        this.positionMarker = None;
        this.map = None;
        
        this.hidingLocation = false;
        settings.addWatcher("hiding-location", new Watcher((hidingLocationUnknown) => {
            const hidingLocation = hidingLocationUnknown as boolean;
            this.onChangeHidingLocation(hidingLocation);
        }));

        const onPositionUpdate = (latestPosition: GeolocationPosition) => {
            this.onPositionUpdate(latestPosition);
        };
        const onPositionError = (error: GeolocationPositionError) => {
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

    private onPositionUpdate(latestPosition: GeolocationPosition): void {
        const coords = latestPosition.coords;

        if (LLocation.latLongNearChurchill(coords.latitude, coords.longitude)) {
            this.setPositionStateNearChurchill(coords);
        } else {
            this.setPositionStateNotNearChurchill();
        }
    }

    private onPositionError(error: GeolocationPositionError): void {
        this.logger.log(`geolocation error: ${error.message}`);
        this.setPositionStateUnknown();
    }

    private setPositionStateNearChurchill(coords: GeolocationCoordinates): void {
        const latestAccuracyRadius = LLocation.metersToFeet(coords.accuracy);
        const latestPosition = LLocation.latLongToChurchillSpace(coords.latitude, coords.longitude);

        if (this.positionState === PositionState.NearChurchill) {
            const distToLast = LLocation.distanceBetween(latestPosition, this.latestPosition.unwrap());
            if (distToLast < SENSITIVITY) {
                this.logger.log(`got update, not moving dot (distance of ${distToLast})`);
                return; // Did not move enough; probably just in one place with GPS noise
            } else {
                this.logger.log(`got update, moving dot (distance of ${distToLast})`);
            }
        }

        this.positionState = PositionState.NearChurchill;

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
        if (this.positionState === PositionState.NearChurchill) {
            // Show greyed out circle instead
            this.positionState = PositionState.UnsureNearChurchill;

            const latestPosition = this.latestPosition.unwrap();
            const latestAccuracyRadius = this.latestAccuracyRadius.unwrap();

            this.positionMarker.ifSome(positionMarker => super.removeLayer(positionMarker));
            this.positionMarker = Some(new PositionMarker(latestPosition, latestAccuracyRadius, true));
        } else {
            this.positionState = PositionState.Unknown;

            this.positionMarker.ifSome(positionMarker => super.removeLayer(positionMarker));
    
            this.control.onLocationNotAvailable();
        }
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

    private static distanceBetween(a: [number, number], b: [number, number]): number {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return (dx * dx) + (dy * dy);
    }
}

enum PositionState {
    Unknown,
    NearChurchill,
    UnsureNearChurchill,
    NotNearChurchill
}

class PositionMarker extends L.LayerGroup {
    constructor(position: [number, number], accuracyRadius: number, unsure: boolean=false) {
        const positionLeaflet = new L.LatLng(position[1], position[0]);

        const color = unsure ? "#bcbcbc" : "#3388ff";

        const positionPoint = L.circleMarker(positionLeaflet, {
            radius: 1,
            color: color
        });
        const accuracyCircle = L.circle(positionLeaflet, {
            stroke: false,
            radius: accuracyRadius,
            color: color
        });

        super([positionPoint, accuracyCircle]);
    }
}
