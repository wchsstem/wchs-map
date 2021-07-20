import { CustomElement } from "./custom/CustomElement";

export type Props = {
    [name: string]: unknown;
};

/**
 * Creates elements (both custom elements and standard HTML elements) for JSX
 */
export interface ElementCreator {
    /**
     * Create an HTML element from a JSX tag
     * @param tag Tag name of the element (eg. `div`) or the class of a custom element
     * @param props Properties of the element
     * @param children Children of the element
     */
    create(
        tag: string | { new (): CustomElement },
        props: Props | null,
        children: HTMLElement[],
    ): HTMLElement;
}
