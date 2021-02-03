import * as L from "leaflet";
import { Some, None, Option, fromMap } from "@nvarner/monads";

import "./floors.scss";
import MapData from "../ts/MapData";

export class LFloors extends L.LayerGroup {
    private allFloors: Map<string, L.LayerGroup>;
    private control: Option<LFloorsControl>;
    private defaultFloorNumber: string;
    private currentFloor: L.LayerGroup;
    private currentFloorNumber: string;

    // Stores all additions to the map by floor number
    private additions: Map<string, Set<L.Layer>>;

    /**
     * Creates a new layer that allows for switching between floors of a building.
     * @param map The map data object for the map
     * @param defaultFloorNumber The number of the floor to start on
     * @param options Any extra Leaflet layer options
     */
    constructor(map: MapData, defaultFloorNumber: string, options: L.LayerOptions) {
        super([], options);

        this.allFloors = new Map();
        this.control = None;

        // Reversing the array means that floors are ordered intuitively in the JSON (1, 2, 3...) and intuitively in the
        // control (higher floors on top)
        for (const floorData of map.getFloors().reverse()) {
            const floorMap = L.imageOverlay(floorData.image, map.getBounds());
            this.allFloors.set(floorData.number, L.layerGroup([floorMap]));
        }

        this.defaultFloorNumber = defaultFloorNumber;

        this.currentFloor = fromMap(this.allFloors, this.defaultFloorNumber).unwrap();
        this.currentFloorNumber = this.defaultFloorNumber;
        super.addLayer(this.currentFloor);

        this.additions = new Map();
    }

    getFloors(): IterableIterator<string> {
        return this.allFloors.keys();
    }

    private startDrawingFloor(floor: L.LayerGroup, floorNumber: string) {
        super.addLayer(floor);
        fromMap(this.additions, floorNumber).ifSome(additions => {
            additions.forEach(addition => floor.addLayer(addition));
        });
    }

    private stopDrawingFloor(floor: L.LayerGroup, floorNumber: string) {
        fromMap(this.additions, floorNumber).ifSome(additions => {
            additions.forEach(addition => floor.removeLayer(addition));
        });
        super.removeLayer(floor);
    }
    
    public setFloor(floor: string): this {
        fromMap(this.allFloors, floor).ifSome(newFloor => {
            if (newFloor !== this.currentFloor) {
                this.control.ifSome(control => control.setFloor(this.currentFloorNumber, floor));

                this.stopDrawingFloor(this.currentFloor, this.currentFloorNumber);

                this.currentFloor = newFloor;
                this.currentFloorNumber = floor;

                this.startDrawingFloor(this.currentFloor, this.currentFloorNumber);
            }
        });

        return this;
    }

    public addLayer(layer: LSomeLayerWithFloor): this {
        const floorNumber = layer.getFloorNumber();
        return this.addLayerToFloor(layer, floorNumber);
    }

    public addLayerToFloor(layer: L.Layer, floorNumber: string): this {
        const floorLayers = fromMap(this.additions, floorNumber).unwrapOr(new Set());
        floorLayers.add(layer);
        this.additions.set(floorNumber, floorLayers);

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

        const floorAdditions = this.additions.get(floorNumber);
        if (floorAdditions) {
            floorAdditions.delete(layer);
        }
        return this;
    }

    getDefaultFloor(): string {
        return this.defaultFloorNumber;
    }

    onAdd(map: L.Map): this {
        super.onAdd(map);
        
        const control = new LFloorsControl(
            this.getFloors(),
            this.getDefaultFloor(),
            (floor) => { this.setFloor(floor) },
            { position: "bottomleft" }
        );
        control.addTo(map);

        this.control = Some(control);

        return this;
    }

    onRemove(map: L.Map): this {
        super.onRemove(map);
        this.control.ifSome(control => map.removeControl(control));
        return this;
    }
}

class LFloorsControl extends L.Control {
    private floors: IterableIterator<string>;
    private defaultFloor: string;
    private setFloorCallback: (floor: string) => void;
    private floorControls: Map<String, HTMLElement>;

    constructor(floors: IterableIterator<string>, defaultFloor: string, setFloorCallback: (floor: string) => void,
        options?: L.ControlOptions) {
        super(options);
        this.floors = floors;
        this.defaultFloor = defaultFloor;
        this.setFloorCallback = setFloorCallback;
        this.floorControls = new Map();
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
        
        this.floorControls.clear();

        for (const floor of this.floors) {
            const a = document.createElement("a");
            a.setAttribute("href", "#");
            a.addEventListener("click", () => {
                this.setFloorCallback(floor);
                for (const otherFloorA of Array.from(base.children)) {
                    otherFloorA.classList.remove("selected");
                }
                a.classList.add("selected");
            });
            if (floor === this.defaultFloor) {
                a.classList.add("selected");
            }

            const text = document.createTextNode(floor);
            
            a.appendChild(text);
            base.appendChild(a);

            this.floorControls.set(floor, a);
        }

        L.DomEvent.disableClickPropagation(base);
        L.DomEvent.disableScrollPropagation(base);

        return base;
    }

    public setFloor(oldFloorNumber: string, newFloorNumber: string) {
        fromMap(this.floorControls, oldFloorNumber)
            .ifSome(oldControl => oldControl.classList.remove("selected"));
        fromMap(this.floorControls, newFloorNumber)
            .ifSome(newControl => newControl.classList.add("selected"));
    }
}

export interface LSomeLayerWithFloor extends L.Layer {
    getFloorNumber(): string;
}

export interface LLayerWithFloorOptions extends L.LayerOptions {
    floorNumber?: string;
}

export class LLayerGroupWithFloor extends L.LayerGroup implements LSomeLayerWithFloor {
    private floorNumber: string;

    constructor(layers: L.Layer[], options: LLayerWithFloorOptions) {
        super(layers, options);
        this.floorNumber = options.floorNumber || "";
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }
}
