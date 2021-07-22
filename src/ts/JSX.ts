import { ElementCreator, Props } from "./html/ElementCreator";
import { CustomElement } from "./html/custom/CustomElement";

/**
 * Stores a reference to the element creator. Ideally it would be injected into a JSX class, which would then construct
 * elements, but TS does not appear to support this.
 */
class JSXHelper {
    public static elementCreator: ElementCreator;
}

/**
 * Give JSX the element creator to use. This must be called before using JSX tags.
 * @param elementCreator Element creator for the JSX to use
 */
export function injectElementCreator(elementCreator: ElementCreator): void {
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
    if (props !== null) {
        // JSX doesn't like the `class` attribute and prefers `className`, but `ElementCreators` like using the correct
        // attribute names
        props = Object.fromEntries(
            Object.entries(props).map(([key, value]) => [
                key === "className" ? "class" : key,
                value,
            ]),
        );
    }
    return JSXHelper.elementCreator.create(tag, props, children);
}

type JsxEl<T extends HTMLElement> = Omit<Partial<T>, "children">;

/**
 * Easy way to add properties that aren't supported by TS to all elements. Note that `children` serves the special role
 * of controlling the allowed types of children within JSX expressions (eg. `<p>type of this child of p element</p>`).
 */
interface ElWithSpecialProps {
    /**
     * Sets allowed types of child nodes
     */
    children?: (Node | string)[] | Node | string;
    /**
     * ARIA role
     * TODO: Use enum to only allow actual ARIA roles
     */
    role?: string;
}

// This is a listing of elements supported in this project's JSX implementation. These are supported because they are
// the ones in use/in use at some point in time. To add a new element, create in interface for it, then add an entry to
// IntrinsicElements. The property name in IntrinsicElements should match the tag name (eg. to add support for
// <schoolMap>, create `interface SchoolMap extends JsxEl<HTMLSchoolMapElement>, ElWithSpecialProps {}`, then add
// `schoolMap: SchoolMap;` to `IntrinsicElements`).

interface Generic extends JsxEl<HTMLElement>, ElWithSpecialProps {}

interface A extends JsxEl<HTMLAnchorElement>, ElWithSpecialProps {}
interface Canvas extends JsxEl<HTMLCanvasElement>, ElWithSpecialProps {}
interface Div extends JsxEl<HTMLDivElement>, ElWithSpecialProps {}
interface H extends JsxEl<HTMLHeadingElement>, ElWithSpecialProps {}
interface Input extends JsxEl<HTMLInputElement>, ElWithSpecialProps {}
interface Label extends JsxEl<HTMLLabelElement>, ElWithSpecialProps {}
interface Li extends JsxEl<HTMLLinkElement>, ElWithSpecialProps {}
interface Ol extends JsxEl<HTMLOListElement>, ElWithSpecialProps {}
interface Option extends JsxEl<HTMLOptionElement>, ElWithSpecialProps {}
interface P extends JsxEl<HTMLParagraphElement>, ElWithSpecialProps {}
interface Select extends JsxEl<HTMLSelectElement>, ElWithSpecialProps {}
interface Span extends JsxEl<HTMLSpanElement>, ElWithSpecialProps {}
interface Ul extends JsxEl<HTMLUListElement>, ElWithSpecialProps {}

// namespaces seem to be required for JSX to work properly
// eslint-disable-next-line
export namespace h {
    // eslint-disable-next-line
    export declare namespace JSX {
        interface IntrinsicElements {
            a: A;
            canvas: Canvas;
            div: Div;
            h1: H;
            h2: H;
            h3: H;
            h4: H;
            h5: H;
            h6: H;
            i: Generic;
            input: Input;
            label: Label;
            li: Li;
            ol: Ol;
            option: Option;
            p: P;
            select: Select;
            span: Span;
            ul: Ul;
        }

        // Unfortunately, TS/JSX doesn't seem to support typing JSX expressions with the exact element type (eg. <input>
        // can't have the HTMLInputElement type), so everything just has to be an HTMLElement. As a result, some JSX
        // expressions have to be casted (eg. to get the value from an <input>).
        type Element = HTMLElement;
    }
}
