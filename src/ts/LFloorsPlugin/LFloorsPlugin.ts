import { fromMap, Result, Err, Ok } from "@nvarner/monads";

import "./floors.scss";
import { MapData } from "../MapData";
import { imageOverlay, Layer, layerGroup, LayerGroup, LayerOptions } from "leaflet";
import { zip } from "../utils";
import { FloorsControl } from "./FloorsControl";
import { IInjectableFactory } from "../IInjectableFactory";

export function floorsFactoryFactory(
    defaultFloorNumber: string,
    options: L.LayerOptions
): IInjectableFactory<LFloors, readonly["mapData"]> {
    const factory = (map: MapData) => {
        return LFloors.new(map, defaultFloorNumber, options);
    }
    factory.inject = ["mapData"] as const;
    return factory;
}

export class LFloors extends LayerGroup {
    /** Mapping from floor numbers to floors */
    private readonly allFloors: Map<string, LayerGroup>;

    /** Control used to switch between layers on the map */
    private readonly control: FloorsControl;

    /** Floor currently being rendered */
    private currentFloor: LayerGroup;
    /** Floor number of `currentFloor` */
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
            new LFloors(options, allFloors, defaultFloorNumber, currentFloor, defaultFloorNumber, new Map())
        );
    }

    private constructor(
        options: LayerOptions,
        allFloors: Map<string, L.LayerGroup>,
        defaultFloorNumber: string,
        currentFloor: L.LayerGroup,
        currentFloorNumber: string,
        additions: Map<string, Set<Layer>>
    ) {
        super([], options);
        super.addLayer(currentFloor);

        this.control = new FloorsControl(
            [...allFloors.keys()],
            defaultFloorNumber,
            floor => {
                this.setFloor(floor);
            },
            { position: "bottomleft" }
        );

        this.allFloors = allFloors;
        this.currentFloor = currentFloor;
        this.currentFloorNumber = currentFloorNumber;
        this.additions = additions;
    }

    /** Get the floor number for all floors */
    public getFloors(): IterableIterator<string> {
        return this.allFloors.keys();
    }

    /**
     * Make Leaflet start rendering `floor` on the map
     * @param floor Floor to start rendering
     * @param floorNumber Number of the floor to render
     */
    private startDrawingFloor(floor: L.LayerGroup, floorNumber: string) {
        super.addLayer(floor);
        fromMap(this.additions, floorNumber).ifSome(additions => {
            additions.forEach(addition => floor.addLayer(addition));
        });
    }

    /**
     * Make Leaflet stop rendering `floor` on the map
     * @param floor Floor to stop rendering
     * @param floorNumber Number of the floor to stop rendering
     */
    private stopDrawingFloor(floor: L.LayerGroup, floorNumber: string) {
        fromMap(this.additions, floorNumber).ifSome(additions => {
            additions.forEach(addition => floor.removeLayer(addition));
        });
        super.removeLayer(floor);
    }
    
    /**
     * Switch the currently rendered floor to `floor`. Has no effect if `floor` is already the currently rendered floor.
     * @param floor Floor to switch to
     */
    public setFloor(floor: string): this {
        fromMap(this.allFloors, floor).ifSome(newFloor => {
            if (newFloor !== this.currentFloor) {
                this.control.setFloor(this.currentFloorNumber, floor);

                this.stopDrawingFloor(this.currentFloor, this.currentFloorNumber);

                this.currentFloor = newFloor;
                this.currentFloorNumber = floor;

                this.startDrawingFloor(this.currentFloor, this.currentFloorNumber);
            }
        });

        return this;
    }

    /**
     * Get the floor number of the floor currently being rendered
     */
    public getCurrentFloor(): string {
        return this.currentFloorNumber;
    }

    public addLayer(layer: LSomeLayerWithFloor): this {
        const floorNumber = layer.getFloorNumber();
        return this.addLayerToFloor(layer, floorNumber);
    }

    /**
     * Adds `layer` to the layer group on a specific floor. Will only be rendered by Leaflet when the given floor is
     * being rendered.
     * @param layer Layer to add
     * @param floorNumber Floor number to add the floor on
     */
    public addLayerToFloor(layer: L.Layer, floorNumber: string): this {
        const floorLayers = fromMap(this.additions, floorNumber).unwrapOr(new Set());
        floorLayers.add(layer);
        this.additions.set(floorNumber, floorLayers);

        if (floorNumber === this.currentFloorNumber) {
            this.currentFloor.addLayer(layer);
        }

        return this;
    }

    public removeLayer(layer: LSomeLayerWithFloor): this {
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

    public onAdd(map: L.Map): this {
        super.onAdd(map);
        this.control.addTo(map);
        return this;
    }

    public onRemove(map: L.Map): this {
        super.onRemove(map);
        map.removeControl(this.control);
        return this;
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
