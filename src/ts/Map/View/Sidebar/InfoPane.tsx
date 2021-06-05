import { Some } from "@nvarner/monads";
import { genButtonIcon, genPaneElement } from "../../../GenHtml/GenHtml";
import { IGeocoderDefinition } from "../../../Geocoder/IGeocoderDefinition";
import { h } from "../../../JSX";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Pane } from "./Pane";

export class InfoPane extends Pane {
    private readonly focusDefinitionHandlers: ((definition: IGeocoderDefinition) => void)[];

    private readonly pane: HTMLElement;

    public constructor(definition: IGeocoderDefinition, private readonly navigationPane: NavigationPane) {
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
    public registerOnFocusDefinition(onFocusDefinition: (definition: IGeocoderDefinition) => void): void {
        this.focusDefinitionHandlers.push(onFocusDefinition);
    }

    private onFocusDefinition(definition: IGeocoderDefinition): void {
        this.focusDefinitionHandlers.forEach(handler => handler(definition));
    }

    private createHeader(paneElements: HTMLElement[], definition: IGeocoderDefinition) {
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
            this.navigationPane.navigateTo(Some(definition), true, true);
        }, "Navigate");
        header.appendChild(navButton);
    }
}