import { ElementCreator, Props } from "./ElementCreator";
import { CustomElement } from "./custom/CustomElement";

export type ElementFactory = (
    props: Props | null,
    children: HTMLElement[],
) => HTMLElement;

/**
 * Element creator which supports custom elements (ie. elements starting with uppercase letters that are implemented in
 * terms of lower level elements).
 */
export class CustomElementCreator implements ElementCreator {
    private createIfCustom(
        tag: { new (): CustomElement },
        props: Props | null,
        children: HTMLElement[],
    ): HTMLElement {
        return new tag().render(props, children);
    }

    /**
     * Removes the "on" from the name of an event, eg. "onClick" => "click"
     */
    private removeOnFromEvent(onEvent: string): string {
        const firstChar = onEvent.substring(2, 3).toLowerCase();
        const latterChars = onEvent.substring(3);
        return firstChar + latterChars;
    }

    private appendChild(
        parent: HTMLElement,
        child: HTMLElement | string | (HTMLElement | string)[],
    ): void {
        if (Array.isArray(child)) {
            child.forEach((inner) => this.appendChild(parent, inner));
        } else {
            if (typeof child === "string") {
                parent.appendChild(document.createTextNode(child));
            } else {
                parent.appendChild(child);
            }
        }
    }

    private createIfNotCustom(
        tag: string,
        props: Props | null,
        children: HTMLElement[],
    ): HTMLElement {
        const element = document.createElement(tag);

        if (props !== null) {
            Object.entries(props).forEach(([name, value]) => {
                if (name.startsWith("on")) {
                    const callback =
                        value as EventListenerOrEventListenerObject;
                    element.addEventListener(
                        this.removeOnFromEvent(name),
                        callback,
                    );
                } else {
                    element.setAttribute(name, value as string);
                }
            });
        }

        children.forEach((child) => this.appendChild(element, child));

        return element;
    }

    public create(
        tag: string | { new (): CustomElement },
        props: Props | null,
        children: HTMLElement[],
    ): HTMLElement {
        if (typeof tag === "string") {
            return this.createIfNotCustom(tag, props, children);
        } else {
            return this.createIfCustom(tag, props, children);
        }
    }
}
