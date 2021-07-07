import { genButtonIcon, genPaneElement } from "../../../GenHtml/GenHtml";
import { GeocoderDefinition } from "../../../Geocoder/GeocoderDefinition";
import { h } from "../../../JSX";
import { Events } from "../../../events/Events";
import { Pane } from "./Pane";

export class InfoPane extends Pane {
    private readonly pane: HTMLElement;

    public constructor(
        definition: GeocoderDefinition,
        private readonly events: Events,
    ) {
        super();

        const paneElements: HTMLElement[] = [this.createHeader(definition)];

        const roomFloor = (
            <span>Floor: {definition.getLocation().getFloor()}</span>
        );
        paneElements.push(roomFloor);

        if (definition.getDescription.length !== 0) {
            const description = <p>{definition.getDescription()}</p>;
            paneElements.push(description);
        }

        this.pane = genPaneElement("Room Info", paneElements);
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

    private createHeader(definition: GeocoderDefinition): HTMLElement {
        const viewRoomButton = genButtonIcon(
            "fa-map-pin",
            () => {
                this.events.trigger("clickFocusDefinitionButton", definition);
            },
            "Show room",
        );
        viewRoomButton.classList.add("push-right");

        const navButton = genButtonIcon(
            "fa-location-arrow",
            () => {
                this.events.trigger(
                    "clickNavigateToDefinitionButton",
                    definition,
                );
            },
            "Navigate",
        );

        return (
            <div class="wrapper header-wrapper">
                <h2>{definition.getName()}</h2>
                {viewRoomButton}
                {navButton}
            </div>
        );
    }
}
