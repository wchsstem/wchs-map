import { fromMap } from "@nvarner/monads";

import { GeocoderSuggestion } from "../Geocoder/GeocoderSuggestion";
import { EventMap } from "./EventMap";

export class Events {
    private readonly eventHandlers: Map<string, unknown[]>;

    static inject = [] as const;
    public constructor() {
        this.eventHandlers = new Map();
    }

    public on<T extends keyof EventMap>(event: T, handler: EventMap[T]): void {
        const handlers = fromMap(this.eventHandlers, event).unwrapOr([]);
        handlers.push(handler);
        this.eventHandlers.set(event, handlers);
    }

    public trigger<T extends keyof EventMap>(
        event: T,
        ...eventData: Parameters<EventMap[T]>
    ): void {
        fromMap(this.eventHandlers, event).ifSome((handlers) =>
            handlers.forEach((handler) => {
                const typedHandler = handler as (
                    suggestion: GeocoderSuggestion,
                ) => void;
                // @ts-expect-error: eventData is typed to be the parameters of the handler, so will be valid
                typedHandler(...eventData);
            }),
        );
    }
}
