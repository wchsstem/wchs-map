import { Pane } from "../Pane";

export class HelpPane extends Pane {
    private readonly pane: HTMLElement;

    public constructor() {}

    public getPaneId(): string {
        return "help";
    }

    public getPaneIconClass(): string {
        return "fa-life-ring";
    }

    public getPaneTitle(): string {
        return "Help";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }
}