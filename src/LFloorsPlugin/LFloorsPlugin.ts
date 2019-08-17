import * as L from "leaflet";

import "./floors.scss";
import MapData from "../ts/MapData";
import LRoomLabel from "../LRoomLabelPlugin/LRoomLabelPlugin";

export class LFloors extends L.LayerGroup {
    private allFloors: Map<string, L.LayerGroup>;
    private control: LFloorsControl;
    private defaultFloor: string;
    private currentFloor: L.LayerGroup;
    private currentFloorNumber: string;

    // Stores all additions to the map by floor number
    private additions: Map<string, Set<LSomeLayerWithFloor>>;

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
                const marker = L.marker([room.getCenter()[1], room.getCenter()[0]], {
                    icon: L.icon({
                        iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png",
                        iconSize:     [38, 95], // size of the icon
                        shadowSize:   [50, 64], // size of the shadow
                        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                        shadowAnchor: [4, 62],  // the same for the shadow
                        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                    })
                });
                super.addLayer(marker);
                alert(`Room number: ${room.getRoomNumber()}\nRoom names: ${JSON.stringify(room.getNames())}`);
                super.removeLayer(marker);
            });
            this.allFloors.set(floor, L.layerGroup([floorMap, floorLabelGroup]));
        }

        this.defaultFloor = defaultFloor;
        this.currentFloor = this.allFloors.get(this.defaultFloor);
        this.currentFloorNumber = this.defaultFloor;
        super.addLayer(this.currentFloor);

        this.additions = new Map();
    }

    getFloors(): IterableIterator<string> {
        return this.allFloors.keys();
    }

    getFloor(number: string): L.LayerGroup {
        return this.allFloors.get(number);
    }

    private startDrawingFloor(floor: L.LayerGroup, floorNumber: string) {
        super.addLayer(floor);
        if (this.additions.has(floorNumber)) {
            for (const addition of this.additions.get(floorNumber)) {
                floor.addLayer(addition);
            }
        }
    }

    private stopDrawingFloor(floor: L.LayerGroup, floorNumber: string) {
        if (this.additions.has(floorNumber)) {
            for (const addition of this.additions.get(floorNumber)) {
                floor.removeLayer(addition);
            }
        }
        super.removeLayer(floor);
    }
    
    setFloor(floor: string): this {
        if (this.allFloors.has(floor)) {
            const newFloor = this.allFloors.get(floor);
            if (newFloor !== this.currentFloor) {
                this.stopDrawingFloor(this.currentFloor, this.currentFloorNumber);

                this.currentFloor = newFloor;
                this.currentFloorNumber = floor;

                this.startDrawingFloor(this.currentFloor, this.currentFloorNumber);
            }
        }
        return this;
    }

    addLayer(layer: LSomeLayerWithFloor): this {
        const floorNumber = layer.getFloorNumber();

        // Add set for floor if it does not exist
        if (!this.additions.has(floorNumber)) {
            this.additions.set(floorNumber, new Set());
        }

        this.additions.get(floorNumber).add(layer);

        if (floorNumber === this.currentFloorNumber) {
            this.currentFloor.addLayer(layer);
        }

        return this;
    }

    removeLayer(layer: LSomeLayerWithFloor): this {
        const floorNumber = layer.getFloorNumber();
        if (floorNumber === this.currentFloorNumber) {
            this.currentFloor.removeLayer(layer);
        }
        this.additions.get(floorNumber).delete(layer);
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

export type LSomeLayerWithFloor = LLayerWithFloor | LLayerGroupWithFloor;

export interface LLayerWithFloorOptions extends L.LayerOptions {
    floorNumber?: string;
}

export class LLayerWithFloor extends L.Layer {
    private floorNumber: string;

    constructor(options?: LLayerWithFloorOptions) {
        super(options);
        if (options) {
            this.floorNumber = options.floorNumber || "";
        }
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }
}

export class LLayerGroupWithFloor extends L.LayerGroup {
    private floorNumber: string;

    constructor(layers?: L.Layer[], options?: LLayerWithFloorOptions) {
        super(layers, options);
        if (options) {
            this.floorNumber = options.floorNumber || "";
        }
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }
}
