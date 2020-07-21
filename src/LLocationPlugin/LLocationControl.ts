import * as L from "leaflet";

import { LLocation } from "./LLocationPlugin";

export class LLocationControl extends L.Control {
    private locateCallback: () => void;

    /**
     * Creates a new control that moves the map to the user's location.
     * @param locateCallback Callback function for when the user wants to be located on the map
     * @param options Any extra Leaflet layer options
     */
    constructor(locateCallback: () => void,  options?: L.ControlOptions) {
        super(options);
        this.locateCallback = locateCallback;
    }

    onAdd(_map: L.Map): HTMLElement {
        const base = document.createElement("div");
        base.classList.add("leaflet-bar");
        base.classList.add("leaflet-control");
        base.classList.add("leaflet-control-floors");

        const a = document.createElement("a");
        a.setAttribute("href", "#");
        a.addEventListener("click", this.locateCallback);

        const pinIcon = document.createElement("i");
        pinIcon.classList.add("fas");
        pinIcon.classList.add("fa-map-pin");
        a.appendChild(pinIcon);

        base.appendChild(a);

        L.DomEvent.disableClickPropagation(base);
        L.DomEvent.disableScrollPropagation(base);

        return base;
    }
}