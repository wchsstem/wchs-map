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

    private container?: HTMLElement;
    private resultContainer?: HTMLElement;

    private clearResults(): void {
        if (!this.resultContainer || !this.container) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        this.resultContainer.classList.add("hidden");
        this.container.classList.remove("showing-results");
        DomUtils.clearChildren(this.resultContainer);
    }

    private chooseResult(
        result: GeocoderSuggestion,
        onChooseResult: (result: GeocoderSuggestion) => void,
        searchBoxWriter: TextBoxWriter,
    ): void {
        onChooseResult(result);
        searchBoxWriter.write(result.name);
        this.clearResults();
    }

    private updateWithResults(
        query: string,
        resultIcon: HTMLElement,
        results: GeocoderSuggestion[],
        searchBoxWriter: TextBoxWriter,
        onChooseResult: (result: GeocoderSuggestion) => void,
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
            for (const result of results) {
                const onClick = (): void => {
                    this.chooseResult(result, onChooseResult, searchBoxWriter);
                };
                const resultElement = (
                    <li className="search-result" onclick={onClick}>
                        <a href="#">
                            {resultIcon.cloneNode()}
                            {result.name}
                        </a>
                    </li>
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
        searchBoxWriter: TextBoxWriter,
        onChooseResult: (result: GeocoderSuggestion) => void,
    ): Promise<void> {
        let results = await geocoder.getSuggestionsFrom(query);
        if (maxResults >= 0) {
            results = results.slice(0, maxResults);
        }
        this.updateWithResults(
            query,
            resultIcon,
            results,
            searchBoxWriter,
            onChooseResult,
        );
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

        this.resultClearer =
            props !== null && props.resultClearer !== undefined
                ? props.resultClearer
                : new ResultClearer();
        this.resultClearer.linkRoomSearchBox(() => this.clearResults());

        const searchBox = (
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
                            searchBoxWriter,
                            props.onChooseResult,
                        );
                    }
                }}
                linkToWriter={searchBoxWriter}
            />
        );

        container.appendChild(searchBox);
        container.appendChild(resultContainer);
        return container;
    }
}
