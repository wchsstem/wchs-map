import * as L from "leaflet";

import "./floors.scss";
import MapData from "../ts/MapData";
import LRoomLabel from "../LRoomLabelPlugin/LRoomLabelPlugin";

export default class LFloors extends L.LayerGroup {
    private allFloors: Map<string, L.LayerGroup>;
    private control: LFloorsControl;
    private defaultFloor: string;
    private lastFloor: L.Layer;

    /**
     * Creates a new layer that allows for switching between floors of a building.
     * @param floors An array of all the floor numbers
     * @param defaultFloor The floor to start on
     * @param map The map data object for the map
     * @param bounds The bonds of the map
     * @param options Any extra Leaflet layer options
     */
    constructor(floors: string[], defaultFloor: string, map: MapData, bounds: L.LatLngBounds, options?: L.LayerOptions) {
        super([], options);

        this.allFloors = new Map();
        for (const floor of floors) {
            const floorMap = L.imageOverlay(map.getMapImageUrl(floor), bounds);
            const floorLabelGroup = new LRoomLabel(map, floor, (room) => {
                alert("test");
            });
            this.allFloors.set(floor, L.layerGroup([floorMap, floorLabelGroup]));
        }

        this.defaultFloor = defaultFloor;
        this.lastFloor = this.allFloors.get(this.defaultFloor);
        super.addLayer(this.lastFloor);
    }

    getFloors(): IterableIterator<string> {
        return this.allFloors.keys();
    }

    getFloor(number: string): L.LayerGroup {
        return this.allFloors.get(number);
    }
    
    setFloor(floor: string): this {
        if (this.allFloors.has(floor)) {
            const newFloor = this.allFloors.get(floor);
            if (newFloor !== this.lastFloor) {
                super.addLayer(newFloor);
                super.removeLayer(this.lastFloor);
                this.lastFloor = newFloor;
            }
        }
        return this;
    }

    /**
     * Methods such as addLayer should not be called directly.
     */
    addLayer(layer: L.Layer): this {
        return this;
    }

    getDefaultFloor(): string {
        return this.defaultFloor;
    }

    onAdd(map: L.Map): this {
        super.onAdd(map);
        this.control = new LFloorsControl(this, {
            position: "bottomleft"
        });
        this.control.addTo(map);
        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);
        map.removeControl(this.control);
        return this;
    }
}

class LFloorsControl extends L.Control {
    private floors: LFloors;

    constructor(floors: LFloors, options?: L.ControlOptions) {
        super(options);
        this.floors = floors;
    }

    initialize(options: L.ControlOptions): void {
        L.Util.setOptions(this, options);
    }

    onAdd(map: L.Map): HTMLElement {
        return this.regenerate();
    }

    regenerate(): HTMLElement {
        const base = document.createElement("div");
        base.classList.add("leaflet-bar");
        base.classList.add("leaflet-control");
        base.classList.add("leaflet-control-floors");

        for (const floor of this.floors.getFloors()) {
            const a = document.createElement("a");
            a.setAttribute("href", "#");
            a.addEventListener("click", () => {
                this.floors.setFloor(floor);
                for (const otherFloorA of Array.from(base.children)) {
                    otherFloorA.classList.remove("selected");
                }
                a.classList.add("selected");
            });
            if (floor === this.floors.getDefaultFloor()) {
                a.classList.add("selected");
            }

            const text = document.createTextNode(floor);
            
            a.appendChild(text);
            base.appendChild(a);
        }

        L.DomEvent.disableClickPropagation(base);
        L.DomEvent.disableScrollPropagation(base);

        return base;
    }
}
