export function h(tag: string, props: Props | null, ...children: HTMLElement[]): HTMLElement {
    const element = document.createElement(tag);

    if (props !== null) {
        Object.entries(props).forEach(([name, value]) => {
            element.setAttribute(name, value);
        });
    }

    children.forEach(child => appendChild(element, child));

    return element;
}
export namespace h {
    export declare namespace JSX {
        interface IntrinsicElements {
            [name: string]: any
        }
    };
}

function appendChild(parent: HTMLElement, child: HTMLElement | string | (HTMLElement | string)[]): void {
    if (Array.isArray(child)) {
        child.forEach(inner => appendChild(parent, inner));
    } else {
        if (typeof child === "string") {
            parent.appendChild(document.createTextNode(child));
        } else {
            parent.appendChild(child);
        }
    }
}

type Props = {
    [name: string]: string
}
