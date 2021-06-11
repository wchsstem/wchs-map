import { Events } from "../../../events/Events";
import { genButtonIcon, genPaneElement } from "../../../GenHtml/GenHtml";
import { GeocoderDefinition } from "../../../Geocoder/GeocoderDefinition";
import { h } from "../../../JSX";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Pane } from "./Pane";

export class InfoPane extends Pane {
    private readonly focusDefinitionHandlers: ((definition: GeocoderDefinition) => void)[];

    private readonly pane: HTMLElement;

    public constructor(
        definition: GeocoderDefinition,
        private readonly navigationPane: NavigationPane,
        private readonly events: Events
    ) {
        super();

        this.focusDefinitionHandlers = [];

        const paneElements: HTMLElement[] = [];

        this.createHeader(paneElements, definition);

        const roomFloor = <span>Floor: {definition.getLocation().getFloor()}</span>
        paneElements.push(roomFloor);

        if (definition.getDescription.length !== 0) {
            const descriptionEl = document.createElement("p");
            const descriptionText = document.createTextNode(definition.getDescription());
            descriptionEl.appendChild(descriptionText);
            paneElements.push(descriptionEl);
        }

        this.pane = genPaneElement("Room Info", paneElements)
    }

    public getPaneId(): string {
        return "info";
    }

    public getPaneIconClass(): string {
        return "fa-info";
    }

    public getPaneTitle(): string {
        return "Room Info";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }
    
    /**
     * Register a callback for when a definition is focused
     * @param onFocusDefinition The callback, which takes in the definition being focused
     */
    public registerOnFocusDefinition(onFocusDefinition: (definition: GeocoderDefinition) => void): void {
        this.focusDefinitionHandlers.push(onFocusDefinition);
    }

    private onFocusDefinition(definition: GeocoderDefinition): void {
        this.focusDefinitionHandlers.forEach(handler => handler(definition));
    }

    private createHeader(paneElements: HTMLElement[], definition: GeocoderDefinition) {
        const header = document.createElement("div");
        header.classList.add("wrapper");
        header.classList.add("header-wrapper");
        paneElements.push(header);

        const roomName = document.createElement("h2");
        const roomNameText = document.createTextNode(definition.getName());
        roomName.appendChild(roomNameText);
        header.appendChild(roomName);

        const viewRoomButton = genButtonIcon("fa-map-pin", () => {
            this.onFocusDefinition(definition);
        }, "Show room");
        viewRoomButton.classList.add("push-right");
        header.appendChild(viewRoomButton);

        const navButton = genButtonIcon("fa-location-arrow", () => {
            this.events.trigger("clickNavigateToDefinitionButton", definition);
        }, "Navigate");
        header.appendChild(navButton);
    }
}