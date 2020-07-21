import * as L from "leaflet";

import { LLocationControl } from "./LLocationControl";
import { settings, Watcher } from "../ts/settings";

export class LLocation extends L.LayerGroup {
    private control: LLocationControl;

    private latestPosition: [number, number];
    private latestAccuracyRadius: number;

    private hidingLocation: boolean;

    private accuracyCircle: L.Circle | undefined;
    private positionPoint: L.CircleMarker | undefined;

    private map: L.Map;

    /**
     * Creates a new layer that shows the user's location on the map.
     * @param options Any extra Leaflet layer options
     */
    constructor(options?: L.LayerOptions) {
        if (options && !("attribution" in options)) {
            options["attribution"] = "© OpenStreetMap contributors";
        }

        super([], options);

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
        this.control = new LLocationControl(() => { this.locate() }, { position: "topright" });
        this.control.addTo(map);
        this.map = map;

        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);
        map.removeControl(this.control);
        return this;
    }

    private locate(): void {
        // TODO: Deal with no location yet obtained
        this.map.flyToBounds(this.accuracyCircle.getBounds().pad(0.05));
    }

    private onPositionUpdate(latestPosition: Position): void {
        const coords = latestPosition.coords;

        this.latestAccuracyRadius = LLocation.metersToFeet(coords.accuracy);
        this.latestPosition = LLocation.latLongToChurchillSpace(coords.latitude, coords.longitude);
        const latestPositionLeaflet: [number, number] = [this.latestPosition[1], this.latestPosition[0]];

        if (this.positionPoint) { super.removeLayer(this.positionPoint); }
        if (this.accuracyCircle) { super.removeLayer(this.accuracyCircle); }

        this.positionPoint = L.circleMarker(latestPositionLeaflet, { radius: 1 });
        this.accuracyCircle = L.circle(latestPositionLeaflet, {
            stroke: false,
            radius: this.latestAccuracyRadius
        });

        if (!this.hidingLocation) {
            super.addLayer(this.positionPoint);
            super.addLayer(this.accuracyCircle);
        }
    }

    private onPositionError(error: PositionError): void {
        console.log("Error getting position", error);
    }

    private onChangeHidingLocation(hidingLocation: boolean): void {
        this.hidingLocation = hidingLocation;
        if (this.positionPoint) {
            if (this.hidingLocation) {
                super.removeLayer(this.positionPoint);
                super.removeLayer(this.accuracyCircle);
            } else {
                super.addLayer(this.positionPoint);
                super.addLayer(this.accuracyCircle);
            }
        }
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

    private static metersToFeet(meters: number): number {
        return meters * 3.28084;
    }
}
