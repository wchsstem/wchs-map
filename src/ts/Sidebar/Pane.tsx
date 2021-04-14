import { PanelOptions } from "leaflet";

import { h } from "../JSX";

export abstract class Pane {
    abstract getPaneId(): string;
    abstract getPaneIconClass(): string;
    abstract getPaneTitle(): string;
    abstract getPaneElement(): HTMLElement;

    getPanelOptions(): PanelOptions {
        return {
            id: this.getPaneId(),
            tab: <i class={`fas ${this.getPaneIconClass()}`} />,
            title: this.getPaneTitle(),
            pane: this.getPaneElement()
        };
    }
}