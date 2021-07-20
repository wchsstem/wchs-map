import { ElementCreator, Props } from "./html/ElementCreator";
import { CustomElement } from "./html/custom/CustomElement";

class JSXHelper {
    static elementCreator: ElementCreator;
}

export function injectElementCreator(elementCreator: ElementCreator) {
    JSXHelper.elementCreator = elementCreator;
}

export function h(
    tag: string | { new (): CustomElement },
    props: Props | null,
    ...children: HTMLElement[]
): HTMLElement {
    console.log(tag, props, children);
    if (typeof tag === "string") {
        return JSXHelper.elementCreator.create(tag, props, children);
    } else {
        console.log("pre", tag);
        const a = new tag();
        console.log("a", a);
        const b = a.render(props, children);
        console.log("b", b);
        return b;
    }
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
