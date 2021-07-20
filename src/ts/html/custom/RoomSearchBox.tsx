import { h } from "../../JSX";
import { Props } from "../ElementCreator";
import { CustomElement } from "./CustomElement";

/**
 * Represents a search box with room search suggestions.
 */
export class RoomSearchBox implements CustomElement {
    public render(props: Props | null, children: HTMLElement[]): HTMLElement {
        return (<div>custom element</div>) as HTMLElement;
    }
}
