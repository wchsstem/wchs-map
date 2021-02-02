import * as L from "leaflet";

export class LLocationControl extends L.Control {
    private locateCallback: () => void;
    private locateButton: HTMLElement;

    /**
     * Creates a new control that moves the map to the user's location.
     * @param locateCallback Callback function for when the user wants to be located on the map
     * @param options Any extra Leaflet layer options
     */
    constructor(locateCallback: () => void,  options?: L.ControlOptions) {
        super(options);
        this.locateCallback = locateCallback;
        this.locateButton = LLocationControl.createLocateButton();
    }

    private static createLocateButton(): HTMLElement {
        const button = document.createElement("a");
        button.setAttribute("href", "#");
        button.classList.add("leaflet-disabled");

        const icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add("fa-map-pin");
        button.appendChild(icon);

        return button;
    }

    onAdd(_map: L.Map): HTMLElement {
        const base = document.createElement("div");
        base.classList.add("leaflet-bar");
        base.classList.add("leaflet-control");
        base.classList.add("leaflet-control-floors");
        base.appendChild(this.locateButton);

        L.DomEvent.disableClickPropagation(base);
        L.DomEvent.disableScrollPropagation(base);

        return base;
    }

    public onLocationAvailable(): void {
        this.locateButton.addEventListener("click", this.locateCallback);
        this.locateButton.classList.remove("leaflet-disabled");
    }

    public onLocationNotAvailable(): void {
        this.locateButton.removeEventListener("click", this.locateCallback);
        this.locateButton.classList.add("leaflet-disabled");
    }
}