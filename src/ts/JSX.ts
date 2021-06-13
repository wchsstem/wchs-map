export function h(
    tag: string,
    props: Props | null,
    ...children: HTMLElement[]
): HTMLElement {
    const element = document.createElement(tag);

    if (props !== null) {
        Object.entries(props).forEach(([name, value]) => {
            if (name.startsWith("on")) {
                const callback = value as EventListenerOrEventListenerObject;
                element.addEventListener(removeOnFromEvent(name), callback);
            } else {
                element.setAttribute(name, value as string);
            }
        });
    }

    children.forEach((child) => appendChild(element, child));

    return element;
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

/**
 * Removes the "on" from the name of an event, eg. "onClick" => "click"
 */
function removeOnFromEvent(onEvent: string): string {
    const firstChar = onEvent.substring(2, 3).toLowerCase();
    const latterChars = onEvent.substring(3);
    return firstChar + latterChars;
}

function appendChild(
    parent: HTMLElement,
    child: HTMLElement | string | (HTMLElement | string)[],
): void {
    if (Array.isArray(child)) {
        child.forEach((inner) => appendChild(parent, inner));
    } else {
        if (typeof child === "string") {
            parent.appendChild(document.createTextNode(child));
        } else {
            parent.appendChild(child);
        }
    }
}

type Props = {
    [name: string]: unknown;
};
