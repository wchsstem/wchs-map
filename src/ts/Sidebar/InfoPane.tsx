import { Some } from "@nvarner/monads";
import { genButtonIcon, genPaneElement } from "../GenHtml/GenHtml";
import { GeocoderDefinition } from "../Geocoder";
import { h } from "../JSX";
import { NavigationPane } from "./NavigationPane/NavigationPane";
import { Pane } from "./Pane";

export class InfoPane extends Pane {
    private readonly pane: HTMLElement;

    private readonly navigationPane: NavigationPane;
    private readonly moveToDefinition: (definition: GeocoderDefinition) => void;

    public constructor(
        definition: GeocoderDefinition,
        navigationPane: NavigationPane,
        moveToDefinition: (definition: GeocoderDefinition) => void
    ) {
        super();

        this.navigationPane = navigationPane;
        this.moveToDefinition = moveToDefinition;
        
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

        this.pane = genPaneElement("Room Info", paneElements);

        this.moveToDefinition(definition);
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
            this.moveToDefinition(definition);
        }, "Show room");
        viewRoomButton.classList.add("push-right");
        header.appendChild(viewRoomButton);

        const navButton = genButtonIcon("fa-location-arrow", () => {
            this.navigationPane.navigateTo(Some(definition), true, true);
        }, "Navigate");
        header.appendChild(navButton);
    }
}