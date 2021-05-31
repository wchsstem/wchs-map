import { Some, None, Option, fromMap, Result, Err, Ok } from "@nvarner/monads";

import "./floors.scss";
import { MapData } from "../MapData";
import { Control, DomEvent, imageOverlay, Layer, layerGroup, LayerGroup, LayerOptions, Util } from "leaflet";
import { zip } from "../utils";

export class LFloors extends LayerGroup {
    private readonly allFloors: Map<string, LayerGroup>;
    private readonly defaultFloorNumber: string;

    private control: Option<LFloorsControl>;

    private currentFloor: LayerGroup;
    private currentFloorNumber: string;

    /** Stores all additions to the map by floor number */
    private additions: Map<string, Set<Layer>>;

    /**
     * Creates a new layer that allows for switching between floors of a building.
     * @param map The map data object for the map
     * @param defaultFloorNumber The number of the floor to start on
     * @param options Any extra Leaflet layer options
     */
    public static new(map: MapData, defaultFloorNumber: string, options: L.LayerOptions): Result<LFloors, string> {
        const allFloorData = map
            .getAllFloors()
            // Reversing the array means that floors are ordered intuitively in the JSON (1, 2, 3...) and intuitively in
            // the control (higher floors on top)
            .reverse()

        const floorImages = allFloorData
            .map(floorData => imageOverlay(floorData.image, map.getBounds(), { pane: "tilePane" }))
            .map(image => layerGroup([image]));
        
        const floorNumbers = allFloorData.map(floorData => floorData.number);

        const allFloors = new Map(zip(floorNumbers, floorImages));

        const resCurrentFloor = fromMap(allFloors, defaultFloorNumber).match({
            some: floor => Ok(floor),
            none: Err(`could not find floor ${defaultFloorNumber}`) as Result<LayerGroup, string>
        });
        if (resCurrentFloor.isErr()) {
            return Err(resCurrentFloor.unwrapErr());
        }
        const currentFloor = resCurrentFloor.unwrap();

        return Ok(
            new LFloors(options, allFloors, None, defaultFloorNumber, currentFloor, defaultFloorNumber, new Map())
        );
    }

    private constructor(
        options: LayerOptions,
        allFloors: Map<string, L.LayerGroup>,
        control: Option<LFloorsControl>,
        defaultFloorNumber: string,
        currentFloor: L.LayerGroup,
        currentFloorNumber: string,
        additions: Map<string, Set<Layer>>
    ) {
        super([], options);
        super.addLayer(currentFloor);

        this.allFloors = allFloors;
        this.control = control;
        this.defaultFloorNumber = defaultFloorNumber;
        this.currentFloor = currentFloor;
        this.currentFloorNumber = currentFloorNumber;
        this.additions = additions;
    }

    public getFloors(): IterableIterator<string> {
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

    public getCurrentFloor(): string {
        return this.currentFloorNumber;
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

class LFloorsControl extends Control {
    private floors: IterableIterator<string>;
    private defaultFloor: string;
    private setFloorCallback: (floor: string) => void;
    private floorControls: Map<string, HTMLElement>;

    constructor(floors: IterableIterator<string>, defaultFloor: string, setFloorCallback: (floor: string) => void,
        options?: L.ControlOptions) {
        super(options);
        this.floors = floors;
        this.defaultFloor = defaultFloor;
        this.setFloorCallback = setFloorCallback;
        this.floorControls = new Map();
    }

    initialize(options: L.ControlOptions): void {
        Util.setOptions(this, options);
    }

    onAdd(_map: L.Map): HTMLElement {
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

        DomEvent.disableClickPropagation(base);
        DomEvent.disableScrollPropagation(base);

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

export class LLayerGroupWithFloor extends LayerGroup implements LSomeLayerWithFloor {
    private floorNumber: string;

    constructor(layers: L.Layer[], options: LLayerWithFloorOptions) {
        super(layers, options);
        this.floorNumber = options.floorNumber || "";
    }

    public getFloorNumber(): string {
        return this.floorNumber;
    }
}
