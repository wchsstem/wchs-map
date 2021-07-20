import { h } from "../../JSX";
import { Props } from "../ElementCreator";
import { CustomElement } from "./CustomElement";

export function roomSearchBoxFactory(
    props: Props | null,
    children: HTMLElement[],
): HTMLElement {
    alert("test");
    return (<div></div>) as HTMLElement;
}

export class RoomSearchBox implements CustomElement {
    public render(props: Props | null, children: HTMLElement[]): HTMLElement {
        return (<div>custom element</div>) as HTMLElement;
    }
}
