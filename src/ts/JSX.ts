import { ElementCreator, Props } from "./html/ElementCreator";
import { CustomElement } from "./html/custom/CustomElement";

/**
 * Stores a reference to the element creator. Ideally it would be injected into a JSX class, which would then construct
 * elements, but TS does not appear to support this.
 */
class JSXHelper {
    static elementCreator: ElementCreator;
}

/**
 * Give JSX the element creator to use. This must be called before using JSX tags.
 * @param elementCreator Element creator for the JSX to use
 */
export function injectElementCreator(elementCreator: ElementCreator) {
    JSXHelper.elementCreator = elementCreator;
}

/**
 * Used by TS to turn JSX tags into HTML elements. Should be imported everywhere JSX is used, but does not need to be
 * called manually.
 */
export function h(
    tag: string | { new (): CustomElement },
    props: Props | null,
    ...children: HTMLElement[]
): HTMLElement {
    return JSXHelper.elementCreator.create(tag, props, children);
}

// namespaces seem to be required for JSX to work properly
// eslint-disable-next-line
export namespace h {
    // eslint-disable-next-line
    export declare namespace JSX {
        interface IntrinsicElements {
            [name: string]: unknown;
        }
    }
}
