import { Geocoder } from "../../../Geocoder/Geocoder";
import { GeocoderSuggestion } from "../../../Geocoder/GeocoderSuggestion";
import { h } from "../../../JSX";
import { DomUtils } from "../../DomUtils";
import { Props } from "../../ElementCreator";
import { CustomElement } from "../CustomElement";
import { TextBox } from "../textBox/TextBox";
import { TextBoxWriter } from "../textBox/TextBoxWriter";
import { ResultClearer } from "./ResultClearer";
import "./room-search-box.scss";

export interface RoomSearchBoxProps extends Props {
    /**
     * Geocoder to use for room searches
     */
    geocoder: Geocoder;
    /**
     * Icon to place next to results
     */
    resultIcon: HTMLElement;
    /**
     * Handler called when a result is chosen (eg. when a result is clicked)
     */
    onChooseResult: (result: GeocoderSuggestion) => void;
    /**
     * Maximum number of search suggestions to display. Set to `-1` to show all. Defaults to `5`.
     */
    maxResults?: number;
    /**
     * Search box writer to link to the search box
     */
    searchBoxWriter?: TextBoxWriter;
    /**
     * Result clearer to link with the search box
     */
    resultClearer?: ResultClearer;
}

/**
 * Represents a search box with room search suggestions.
 * @see RoomSearchBoxProps
 */
export class RoomSearchBox implements CustomElement {
    /**
     * Default maximum number of search suggestions to display
     */
    private static readonly DEFAULT_MAX_RESULTS: number = 5;

    private resultClearer?: ResultClearer;
    private searchBoxWriter?: TextBoxWriter;

    private onChooseResult?: (result: GeocoderSuggestion) => void;

    private topResult?: GeocoderSuggestion;

    private container?: HTMLElement;
    private searchBox?: HTMLElement;
    private resultContainer?: HTMLElement;

    private clearResults(): void {
        if (!this.resultContainer || !this.container) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        this.resultContainer.classList.add("hidden");
        this.container.classList.remove("showing-results");
        DomUtils.clearChildren(this.resultContainer);
        this.topResult = undefined;
    }

    private chooseResult(result: GeocoderSuggestion): void {
        if (!this.searchBox || !this.onChooseResult || !this.searchBoxWriter) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        this.onChooseResult(result);
        this.searchBoxWriter.write(result.name);
        this.clearResults();

        this.searchBox.focus();
    }

    private createResultElement(
        result: GeocoderSuggestion,
        icon: Node,
    ): HTMLElement {
        const onClick = (): void => {
            this.chooseResult(result);
        };

        const resultElement = (
            <li className="search-result" onclick={onClick}>
                <a href="#">
                    {icon.cloneNode()}
                    {result.name}
                </a>
            </li>
        );

        const onNext = (): void => {
            const nextSib = resultElement.nextSibling;
            if (nextSib && nextSib.firstChild instanceof HTMLElement) {
                nextSib.firstChild.focus();
            } else {
                // Last result, so loop back to top
                const ul = resultElement.parentElement;
                if (
                    ul &&
                    ul.firstChild &&
                    ul.firstChild.firstChild instanceof HTMLElement
                ) {
                    ul.firstChild.firstChild.focus();
                }
            }
        };

        const onPrev = (): void => {
            const prevSib = resultElement.previousSibling;
            if (prevSib && prevSib.firstChild instanceof HTMLElement) {
                prevSib.firstChild.focus();
            } else {
                // First result, so go to search box
                if (this.searchBox) {
                    this.searchBox.focus();
                }
            }
        };

        const onKeydown = (e: KeyboardEvent): void => {
            if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
                e.preventDefault();
                onNext();
            } else if (e.key == "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
                e.preventDefault();
                onPrev();
            }
        };
        resultElement.addEventListener("keydown", onKeydown);

        return resultElement;
    }

    private updateWithResults(
        query: string,
        resultIcon: HTMLElement,
        results: GeocoderSuggestion[],
    ): void {
        if (!this.container || !this.resultContainer) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        this.clearResults();

        if (query === "") {
            return;
        }

        this.resultContainer.classList.remove("hidden");
        this.container.classList.add("showing-results");

        const list = <ul />;
        if (results.length > 0) {
            this.topResult = results[0];
            for (const result of results) {
                const resultElement = this.createResultElement(
                    result,
                    resultIcon.cloneNode(),
                );
                list.appendChild(resultElement);
            }
        } else {
            const container = <li className="no-results">No results</li>;
            list.appendChild(container);
        }
        this.resultContainer.appendChild(list);
    }

    public async handleInput(
        query: string,
        maxResults: number,
        resultIcon: HTMLElement,
        geocoder: Geocoder,
    ): Promise<void> {
        let results = await geocoder.getSuggestionsFrom(query);
        if (maxResults >= 0) {
            results = results.slice(0, maxResults);
        }
        this.updateWithResults(query, resultIcon, results);
    }

    public handleKeypressInInput(e: KeyboardEvent): void {
        if (!this.resultContainer) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const ul = this.resultContainer.firstChild;
            if (
                ul &&
                ul.firstChild &&
                ul.firstChild.firstChild instanceof HTMLElement
            ) {
                ul.firstChild.firstChild.focus();
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (this.topResult) {
                this.chooseResult(this.topResult);
            }
        }
    }

    public render(
        props: RoomSearchBoxProps | null,
        _children: HTMLElement[],
    ): HTMLElement {
        const container = <div className="room-search-box" />;
        this.container = container;

        const resultContainer = (
            <div className="results-wrapper leaflet-style hidden" />
        );
        this.resultContainer = resultContainer;

        const searchBoxWriter =
            props !== null && props.searchBoxWriter !== undefined
                ? props.searchBoxWriter
                : new TextBoxWriter();
        this.searchBoxWriter = searchBoxWriter;

        this.resultClearer =
            props !== null && props.resultClearer !== undefined
                ? props.resultClearer
                : new ResultClearer();
        this.resultClearer.linkRoomSearchBox(() => this.clearResults());

        const onChooseResult = props
            ? props.onChooseResult
            : (_result: GeocoderSuggestion) => {
                  // No handler specified, so do nothing
              };
        this.onChooseResult = onChooseResult;

        this.searchBox = (
            <TextBox
                noBottomMargin={true}
                onInput={(input: string) => {
                    if (props !== null) {
                        const maxResults =
                            props.maxResults === undefined
                                ? RoomSearchBox.DEFAULT_MAX_RESULTS
                                : props.maxResults;
                        this.handleInput(
                            input,
                            maxResults,
                            props.resultIcon,
                            props.geocoder,
                        );
                    }
                }}
                onKeydown={(e: KeyboardEvent) => this.handleKeypressInInput(e)}
                linkToWriter={searchBoxWriter}
            />
        );

        container.appendChild(this.searchBox);
        container.appendChild(resultContainer);
        return container;
    }
}
