import { Props } from "../ElementCreator";

/**
 * Represents an object that can be rendered as an HTML element. When the custom element is used in JSX, its constructor
 * will be called, then `render` will be called with the properties and children the element has. As a result, `render`
 * will be called once for each instance. The parameters being in render is due to technical limitations; if possible,
 * they would be in the constructor, but no way to type check this has been found.
 */
export interface CustomElement {
    render(props: Props | null, children: HTMLElement[]): HTMLElement;
}
