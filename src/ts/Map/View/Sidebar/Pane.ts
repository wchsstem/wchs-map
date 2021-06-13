import { PanelOptions } from "leaflet";

export abstract class Pane {
    abstract getPaneId(): string;
    abstract getPaneIconClass(): string;
    abstract getPaneTitle(): string;
    abstract getPaneElement(): HTMLElement;

    public getPosition(): "top" | "bottom" {
        return "top";
    }

    public getPanelOptions(): PanelOptions {
        return {
            id: this.getPaneId(),
            tab: `<i class="fas ${this.getPaneIconClass()}"></i>`,
            title: this.getPaneTitle(),
            pane: this.getPaneElement(),
            position: this.getPosition(),
        };
    }
}
