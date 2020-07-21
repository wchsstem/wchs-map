import * as L from "leaflet";

export class LLocationControl extends L.Control {
    private locateCallback: () => void;
    private button: HTMLElement;

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

        this.button = document.createElement("a");
        this.button.setAttribute("href", "#");
        this.button.classList.add("leaflet-disabled");

        const pinIcon = document.createElement("i");
        pinIcon.classList.add("fas");
        pinIcon.classList.add("fa-map-pin");
        this.button.appendChild(pinIcon);

        base.appendChild(this.button);

        L.DomEvent.disableClickPropagation(base);
        L.DomEvent.disableScrollPropagation(base);

        return base;
    }

    public onLocationAvailable(): void {
        this.button.addEventListener("click", this.locateCallback);
        this.button.classList.remove("leaflet-disabled");
    }

    public onLocationNotAvailable(): void {
        this.button.removeEventListener("click", this.locateCallback);
        this.button.classList.add("leaflet-disabled");
    }
}