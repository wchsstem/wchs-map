import "./generated.scss";

import Room from "../ts/Room";

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
    rootEl.addEventListener("click", onClick);

    return rootEl;
}

export function genTextInput(placeholder: string, content?: string, border: boolean = true): HTMLInputElement {
    const inputEl = document.createElement("input");
    inputEl.classList.add("leaflet-style");
    inputEl.classList.add("search-bar");
    inputEl.setAttribute("type", "text");
    inputEl.setAttribute("placeholder", placeholder);

    if (!border) {
        inputEl.classList.add("no-border");
    }

    if (content) {
        const contentTn = document.createTextNode(content);
        inputEl.appendChild(contentTn);
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
