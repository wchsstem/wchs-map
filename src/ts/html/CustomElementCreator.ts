import { fromMap, Option } from "@nvarner/monads";

import { ElementCreator, Props } from "./ElementCreator";

export type ElementFactory = (
    props: Props | null,
    children: HTMLElement[],
) => HTMLElement;

/**
 * Element creator which supports custom elements (ie. elements starting with lowercase letters that are not standard).
 * Note that custom elements starting with uppercase letters are technically known as value-based elements and are
 * supported by TypeScript and the custom JSX implementation, not this code.
 */
export class CustomElementCreator implements ElementCreator {
    private readonly elementFromName: Map<string, ElementFactory>;

    public constructor(roomSearchBoxFactory: ElementFactory) {
        this.elementFromName = new Map([]);
    }

    private createIfCustom(
        tag: string,
        props: Props | null,
        children: HTMLElement[],
    ): Option<HTMLElement> {
        return fromMap(this.elementFromName, tag).map((factory) =>
            factory(props, children),
        );
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
    ) {
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
        tag: string,
        props: Props | null,
        children: HTMLElement[],
    ): HTMLElement {
        return this.createIfCustom(tag, props, children).unwrapOrElse(() =>
            this.createIfNotCustom(tag, props, children),
        );
    }
}
