import { h } from "../../JSX";
import { Props } from "../ElementCreator";
import { CustomElement } from "./CustomElement";

export interface FaIconProps extends Props {
    /**
     * Font Awesome icon class without the `"fa"` (eg. `"search"` for
     * https://fontawesome.com/v5.15/icons/search?style=solid)
     */
    faClass: string;
}

/**
 * Font Awesome Icon element. The class name's visual similarity to "Falcon" with some fonts is unintentional but should
 * be appreciated.
 * @see FaIconProps
 */
export class FaIcon implements CustomElement {
    public render(
        props: FaIconProps | null,
        _children: HTMLElement[],
    ): HTMLElement {
        if (props !== null) {
            return <i class={`fas fa-${props.faClass}`} />;
        } else {
            throw new Error("FA icon must have required properties");
        }
    }
}
