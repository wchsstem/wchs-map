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
}

/**
 * Represents a search box with room search suggestions.
 * @see RoomSearchBoxProps
 */
export class RoomSearchBox implements CustomElement {
    private clearResults(resultContainer: HTMLElement): void {
        resultContainer.classList.add("hidden");
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
        this.clearResults(resultContainer);

        if (query === "") {
            return;
        }

        resultContainer.classList.remove("hidden");

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
        resultIcon: HTMLElement,
        resultContainer: HTMLElement,
        geocoder: Geocoder,
        searchBoxWriter: TextBoxWriter,
        onChooseResult: (result: GeocoderSuggestion) => void,
    ): Promise<void> {
        const results = await geocoder.getSuggestionsFrom(query);
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
        const resultContainer = (
            <div class="results-wrapper leaflet-style hidden" />
        );

        const searchBoxWriter = new TextBoxWriter();
        const searchBox = (
            <TextBox
                noBottomMargin={true}
                onInput={(input: string) => {
                    if (props !== null) {
                        this.handleInput(
                            input,
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

        return (
            <div class="room-search-box">
                {searchBox}
                {resultContainer}
            </div>
        );
    }
}
