import "./generated.scss";

import Room from "../ts/Room";
import { T2 } from "../ts/Tuple";

export function genElText(element: string, text: string): HTMLElement {
    const tn = document.createTextNode(text);
    const el = document.createElement(element);
    el.appendChild(tn);
    return el;
}

export function genButton(label: string, onClick?: () => void): HTMLElement {
    const labelEl = genElText("span", label);

    const rootEl = document.createElement("a");
    rootEl.classList.add("leaflet-style");
    rootEl.classList.add("button");
    rootEl.setAttribute("href", "#");
    rootEl.setAttribute("role", "button");
    rootEl.appendChild(labelEl);
    if (onClick) {
        rootEl.addEventListener("click", onClick);
    }

    return rootEl;
}

export function genTextInput(placeholder?: string, content?: string, border: boolean = true): HTMLInputElement {
    const inputEl = document.createElement("input");
    inputEl.classList.add("leaflet-style");
    inputEl.classList.add("search-bar");
    inputEl.setAttribute("type", "text");

    if (placeholder) {
        inputEl.setAttribute("placeholder", placeholder);
    }

    if (!border) {
        inputEl.classList.add("no-border");
    }

    if (content) {
        inputEl.value = content;
    }
    
    return inputEl;
}

export function genRoomPopup(room: Room, navigateToHandler: () => void): HTMLElement {
    const roomNameTn = document.createTextNode(room.getName());
    const roomNameEl = document.createElement("h2");
    roomNameEl.appendChild(roomNameTn);

    const navToButton = genButton("Navigate", navigateToHandler);

    const rootEl = document.createElement("div");
    rootEl.appendChild(roomNameEl);
    rootEl.appendChild(navToButton);
    
    return rootEl;
}

export function htmlDropdown(displayAndIds: T2<string, string>[]): HTMLSelectElement {
    const select = document.createElement("select");
    for (const displayAndId of displayAndIds) {
        const display = displayAndId.e0;
        const id = displayAndId.e1;

        const option = document.createElement("option");
        option.setAttribute("value", id);

        const displayText = document.createTextNode(display);

        option.appendChild(displayText);
        select.appendChild(option);
    }
    return select;
}

export function createPaneElement(title: string, content: HTMLElement | HTMLElement[]): HTMLElement {
    const pane = document.createElement("div");
    pane.classList.add("leaflet-sidebar-pane");

    const header = document.createElement("h1");
    header.classList.add("leaflet-sidebar-header");
    pane.appendChild(header);

    const titleNode = document.createTextNode(title);
    header.appendChild(titleNode);

    const closeSpan = document.createElement("span");
    closeSpan.classList.add("leaflet-sidebar-close");
    header.appendChild(closeSpan);

    const closeIcon = document.createElement("i");
    closeIcon.classList.add("fas");
    closeIcon.classList.add("fa-caret-left");
    closeSpan.appendChild(closeIcon);

    if (Array.isArray(content)) {
        for (const el of content) {
            pane.appendChild(el);
        }
    } else {
        pane.appendChild(content);
    }
    
    return pane;
}

export function label(text: string, labels: string): HTMLLabelElement {
    const label = document.createElement("label");
    label.setAttribute("for", labels);

    const textNode = document.createTextNode(text);

    label.appendChild(textNode);

    return label;
}
