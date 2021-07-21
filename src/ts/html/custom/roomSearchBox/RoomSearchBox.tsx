import { Geocoder } from "../../../Geocoder/Geocoder";
import { GeocoderSuggestion } from "../../../Geocoder/GeocoderSuggestion";
import { h } from "../../../JSX";
import { DomUtils } from "../../DomUtils";
import { Props } from "../../ElementCreator";
import { CustomElement } from "../CustomElement";
import { TextBox } from "../textBox/TextBox";
import { TextBoxWriter } from "../textBox/TextBoxWriter";
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

    private container?: HTMLElement;

    private clearResults(resultContainer: HTMLElement): void {
        if (!this.container) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        resultContainer.classList.add("hidden");
        this.container.classList.remove("showing-results");
        DomUtils.clearChildren(resultContainer);
    }

    private chooseResult(
        result: GeocoderSuggestion,
        onChooseResult: (result: GeocoderSuggestion) => void,
        searchBoxWriter: TextBoxWriter,
        resultContainer: HTMLElement,
    ): void {
        onChooseResult(result);
        searchBoxWriter.write(result.name);
        this.clearResults(resultContainer);
    }

    private updateWithResults(
        query: string,
        resultIcon: HTMLElement,
        resultContainer: HTMLElement,
        results: GeocoderSuggestion[],
        searchBoxWriter: TextBoxWriter,
        onChooseResult: (result: GeocoderSuggestion) => void,
    ): void {
        if (!this.container) {
            throw new Error("did not set all fields in RoomSearchBox");
        }

        this.clearResults(resultContainer);

        if (query === "") {
            return;
        }

        resultContainer.classList.remove("hidden");
        this.container.classList.add("showing-results");

        const list = <ul />;
        if (results.length > 0) {
            for (const result of results) {
                const onClick = (): void => {
                    this.chooseResult(
                        result,
                        onChooseResult,
                        searchBoxWriter,
                        resultContainer,
                    );
                };
                const resultElement = (
                    <li class="search-result" onClick={onClick}>
                        <a href="#">
                            {resultIcon.cloneNode()}
                            {result.name}
                        </a>
                    </li>
                );
                list.appendChild(resultElement);
            }
        } else {
            const container = <li class="search-result">No results</li>;
            list.appendChild(container);
        }
        resultContainer.appendChild(list);
    }

    public async handleInput(
        query: string,
        maxResults: number,
        resultIcon: HTMLElement,
        resultContainer: HTMLElement,
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
            resultContainer,
            results,
            searchBoxWriter,
            onChooseResult,
        );
    }

    public render(
        props: RoomSearchBoxProps | null,
        _children: HTMLElement[],
    ): HTMLElement {
        const container = (<div class="room-search-box" />) as HTMLElement;
        this.container = container;

        const resultContainer = (
            <div class="results-wrapper leaflet-style hidden" />
        );

        const searchBoxWriter = new TextBoxWriter();
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
                            resultContainer,
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
