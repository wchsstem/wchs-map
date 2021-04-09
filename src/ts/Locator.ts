import { None, Option, Some } from "@nvarner/monads";
import { LatLng } from "leaflet";
import { Logger } from "./LogPane/LogPane";

const SENSITIVITY = 10;

export class Locator {
    private readonly logger: Logger;

    private onUpdateStateHandles: ((
        oldState: PositionState,
        newState: PositionState,
        position: Option<LatLng>,
        positionAccuracyRadius: Option<number>
    ) => void)[];
    private positionState: PositionState;
    private latestPosition: Option<LatLng>;
    private latestAccuracyRadius: Option<number>;

    private readonly canEverGeolocate: boolean;

    public constructor(logger: Logger) {
        this.logger = logger;

        this.onUpdateStateHandles = [];
        this.positionState = PositionState.Unknown;
        this.latestPosition = None;
        this.latestAccuracyRadius = None;

        this.canEverGeolocate = "geolocation" in navigator;

        if (this.canEverGeolocate) {
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
    }

    public addStateUpdateHandler(onUpdateState: (
        oldState: PositionState,
        newState: PositionState,
        position: Option<LatLng>,
        accuracyRadius: Option<number>
    ) => void): void {
        this.onUpdateStateHandles.push(onUpdateState);
    }

    public getCanEverGeolocate(): boolean {
        return this.canEverGeolocate;
    }

    public getLatestPosition(): Option<LatLng> {
        return this.latestPosition;
    }

    public getPositionState(): PositionState {
        return this.positionState;
    }

    public isNearChurchill(): boolean {
        const state = this.getPositionState();
        return state === PositionState.NearChurchill || state === PositionState.UnsureNearChurchill;
    }

    private onPositionUpdate(latestPosition: GeolocationPosition): void {
        const coords = latestPosition.coords;

        if (Locator.latLongNearChurchill(coords.latitude, coords.longitude)) {
            this.setPositionStateNearChurchill(coords);
        } else {
            this.setPositionStateNotNearChurchill();
        }
    }

    private onPositionError(error: GeolocationPositionError): void {
        this.logger.log(`geolocation error: ${error.message}`);
        this.setPositionStateUnknown();
    }

    /**
     * Call state change handlers, then update the state to the new state.
     */
    private onUpdateState(
        newState: PositionState,
        position: Option<LatLng>,
        accuracyRadius: Option<number>
    ): void {
        for (const handler of this.onUpdateStateHandles) {
            handler(this.positionState, newState, position, accuracyRadius);
        }
        this.positionState = newState;
        this.latestPosition = position;
        this.latestAccuracyRadius = accuracyRadius;
    }

    private setPositionStateNearChurchill(coords: GeolocationCoordinates): void {
        const position = Locator.latLongToChurchillSpace(coords.latitude, coords.longitude);
        const accuracyRadius = Locator.metersToFeet(coords.accuracy);

        if (this.positionState === PositionState.NearChurchill) {
            const distToLast = position.distanceTo(this.latestPosition.unwrap());
            if (distToLast < SENSITIVITY) {
                this.logger.log(`got update, not moving dot (distance of ${distToLast})`);
                return; // Did not move enough; probably just in one place with GPS noise
            } else {
                this.logger.log(`got update, moving dot (distance of ${distToLast})`);
            }
        }

        this.onUpdateState(PositionState.NearChurchill, Some(position), Some(accuracyRadius));
    }

    private setPositionStateNotNearChurchill(): void {
        // TODO: Switch to lower accuracy GPS readings
        this.onUpdateState(PositionState.NotNearChurchill, this.latestPosition, this.latestAccuracyRadius);
    }

    private setPositionStateUnknown(): void {
        if (this.positionState === PositionState.NearChurchill) {
            this.onUpdateState(PositionState.UnsureNearChurchill, this.latestPosition, this.latestAccuracyRadius);
        } else {
            this.onUpdateState(PositionState.Unknown, this.latestPosition, this.latestAccuracyRadius);
        }
    }

    private static latLongToChurchillSpace(latitude: number, longitude: number): LatLng {
        // Churchill (214, 137.125) becomes (-77.17316, 39.04371) long-lat
        // (408.625, 145.5) -> (-77.17260, 39.04409)
        // (466, 271.25) -> (-77.17277, 39.04453)

        // Affine transformation matrix from long-lat to Churchill coords:
        // 63832500/311  65216250/311 190395034993/24880
        // -44100000/311 71843750/311 -99333444007/4976
        // 0             0            1

        // Calculated based on https://brilliant.org/wiki/affine-transformations/

        const x = (63832500.0 / 311.0) * longitude + (65216250 / 311) * latitude + (190395034993 / 24880);
        const y = (-44100000 / 311) * longitude + (71843750 / 311) * latitude + (-99333444007 / 4976);
        return new LatLng(y, x);
    }

    /**
     * Determines if a lat-long coordinate is near Churchill. Any point within Churchill's campus (school building,
     * parking lots, fields, etc.) must be near Churchill. Points that are physically close to Churchill but not
     * necesarily on campus may be considered near. Points far from Churchill must never be considered near.
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

export enum PositionState {
    Unknown,
    NearChurchill,
    UnsureNearChurchill,
    NotNearChurchill
}