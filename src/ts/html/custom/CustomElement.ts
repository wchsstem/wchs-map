import { Props } from "../ElementCreator";

export interface CustomElement {
    render(props: Props | null, children: HTMLElement[]): HTMLElement;
}
