import { Geocoder } from "../../../Geocoder/Geocoder";
import { GeocoderSuggestion } from "../../../Geocoder/GeocoderSuggestion";
import { h } from "../../../JSX";
import { Events } from "../../../events/Events";
import { DomUtils } from "../../DomUtils";
import { Props } from "../../ElementCreator";
import { CustomElement } from "../CustomElement";
import { TextBox } from "../TextBox";
import "./room-search-box.scss";

export interface RoomSearchBoxProps extends Props {
    geocoder: Geocoder;
    events: Events;
}

/**
 * Represents a search box with room search suggestions.
 */
export class RoomSearchBox implements CustomElement {
    private updateWithResults(
        query: string,
        resultContainer: HTMLElement,
        results: GeocoderSuggestion[],
        onClickResult: (result: GeocoderSuggestion) => void,
    ): void {
        if (query === "") {
            resultContainer.classList.add("hidden");
            return;
        }

        resultContainer.classList.remove("hidden");
        DomUtils.clearChildren(resultContainer);

        const list = <ul />;
        if (results.length > 0) {
            for (const result of results) {
                const resultElement = (
                    <li
                        class="search-result"
                        onClick={() => {
                            onClickResult(result);
                        }}
                    >
                        <i class="fas fa-search" />
                        {result.name}
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
        resultContainer: HTMLElement,
        geocoder: Geocoder,
        events: Events,
    ): Promise<void> {
        const results = await geocoder.getSuggestionsFrom(query);
        this.updateWithResults(query, resultContainer, results, (result) =>
            events.trigger("clickResult", result),
        );
    }

    public render(
        props: RoomSearchBoxProps | null,
        _children: HTMLElement[],
    ): HTMLElement {
        const resultContainer = (
            <div class="results-wrapper leaflet-style hidden" />
        );

        return (
            <div class="room-search-box">
                <TextBox
                    noBottomMargin={true}
                    onInput={(input: string) => {
                        if (props !== null) {
                            this.handleInput(
                                input,
                                resultContainer,
                                props.geocoder,
                                props.events,
                            );
                        }
                    }}
                />
                {resultContainer}
            </div>
        );
    }
}
