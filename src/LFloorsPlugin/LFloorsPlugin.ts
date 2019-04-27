import * as L from "leaflet";

import "./floors.scss";

export default class LFloors extends L.LayerGroup {
    private allFloors: Map<string, L.Layer>;
    private control: LFloorsControl;
    private defaultFloor: string;

    constructor(floors: Map<string, L.Layer>, defaultFloor: string, options?: L.LayerOptions){
        super([], options);
        this.allFloors = floors;
        this.defaultFloor = defaultFloor;
        this.setFloor(this.defaultFloor);
    }

    getFloors(): IterableIterator<string> {
        return this.allFloors.keys();
    }
    
    setFloor(floor: string): this {
        super.clearLayers();
        if (this.allFloors.has(floor)) {
            super.addLayer(this.allFloors.get(floor));
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
    private id: string;

    constructor(floors: LFloors, options?: L.ControlOptions) {
        super(options);
        this.id = `${Math.random()}`;
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

        const form = document.createElement("form");
        for (const floor of this.floors.getFloors()) {
            const name = `floors_${this.id}`;
            const id = `${name}_${floor}`;

            const container = document.createElement("div");

            const radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("name", name);
            radio.setAttribute("id", id);
            radio.addEventListener("click", () => {
                this.floors.setFloor(floor);
            });
            if (floor === this.floors.getDefaultFloor()) {
                radio.setAttribute("checked", "checked");
            }

            const label = document.createElement("label");
            label.setAttribute("for", id);

            const text = document.createTextNode(floor);
            
            container.appendChild(radio);
            label.append(text);
            container.appendChild(label)
            form.appendChild(container);
        }

        base.appendChild(form);

        L.DomEvent.disableClickPropagation(base);
        L.DomEvent.disableScrollPropagation(base);

        return base;
    }
}
