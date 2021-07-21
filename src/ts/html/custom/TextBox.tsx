import { h } from "../../JSX";
import { Props } from "../ElementCreator";
import { CustomElement } from "./CustomElement";

export interface TextBoxProps extends Props {
    /**
     * Placeholder, ie. the lightly colored text displayed when nothing has been typed in to a text box. Potentially bad
     * practice because it makes the box look filled at a glance and because the hint disappears while the user is still
     * typing, so consider if a label might work better. Defaults to no placeholder.
     */
    placeholder?: string;
    /**
     * What is typed in the text box by default. Defaults to no content.
     */
    content?: string;
    /**
     * If there should be a border around the text box or not. Defaults to `true`.
     */
    border?: boolean;
    /**
     * If there should be no margin at the bottom. Defaults to `false`.
     */
    noBottomMargin?: boolean;
    /**
     * Event handler called every time the `input` event is triggered, eg. whenever the user types or deletes a
     * character. Defaults to no event listener.
     */
    onInput?: (newContent: string) => void;
}

/**
 * Styled standard textbox
 * @see TextBoxProps for property documentation
 */
export class TextBox implements CustomElement {
    // eslint-disable-next-line complexity
    public render(
        props: TextBoxProps | null,
        _children: HTMLElement[],
    ): HTMLElement {
        const inputEl = (
            <input class="leaflet-style" type="text" />
        ) as HTMLInputElement;

        if (props !== null) {
            if ("placeholder" in props && props.placeholder !== undefined) {
                inputEl.setAttribute("placeholder", props.placeholder);
            }

            if (
                "border" in props &&
                props.border !== undefined &&
                !props.border
            ) {
                inputEl.classList.add("no-border");
            }

            if (props.noBottomMargin !== undefined && props.noBottomMargin) {
                inputEl.classList.add("no-bottom-margin");
            }

            if ("content" in props && props.content !== undefined) {
                inputEl.value = props.content;
            }

            inputEl.addEventListener("input", () => {
                if ("onInput" in props && props.onInput !== undefined) {
                    props.onInput(inputEl.value);
                }
            });
        }

        return inputEl;
    }
}
