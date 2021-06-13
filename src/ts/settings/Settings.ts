import { fromMap, Option } from "@nvarner/monads";

/**
 * Stores and manages mutable program state that can change at runtime and persists between page reloads. Allows
 * watchers to be notified when data changes.
 */
export class Settings {
    private data: Map<string, unknown>;
    private watchers: Map<string, ((newValue: unknown) => void)[]>;

    /**
     * @param prefix An arbitrary but unique string without underscores that represents this specific settings object
     */
    public constructor(
        /** Used to separate the values of multiple Settings instances in LocalStorage */
        private readonly prefix: string,
    ) {
        this.data = new Map();
        this.watchers = new Map();
        this.loadSavedData();
    }

    /** Loads data saved from a previous page load into this instance by the prefix, if data is available */
    protected loadSavedData(): void {
        if (typeof Storage !== "undefined") {
            for (const key in window.localStorage) {
                if (key.startsWith(`${this.prefix}_`)) {
                    const unprefixedKey = key.substring(this.prefix.length + 1);
                    const data = window.localStorage.getItem(key);
                    if (data !== null) {
                        this.updateData(unprefixedKey, JSON.parse(data));
                    }
                }
            }
        }
    }

    /** Sets the data stored at `id` to the new `data`. Calls relevant watchers. */
    public updateData(id: string, data: unknown): void {
        this.data.set(id, data);
        if (typeof Storage !== "undefined") {
            window.localStorage.setItem(
                `${this.prefix}_${id}`,
                JSON.stringify(data),
            );
        }
        fromMap(this.watchers, id).ifSome((watchers) =>
            watchers.forEach((watcher) => watcher(data)),
        );
    }

    /**
     * Register a function to call when certain data changes
     * @param dataId ID to watch for changes on
     * @param watcher Function to call when data changes
     * @param callOnAdd If true, calls the watcher immediately after registering it
     */
    public addWatcher(
        dataId: string,
        watcher: (newValue: unknown) => void,
        callOnAdd = true,
    ): void {
        const watchersForId = fromMap(this.watchers, dataId).unwrapOr([]);
        watchersForId.push(watcher);
        this.watchers.set(dataId, watchersForId);

        if (callOnAdd) {
            this.getData(dataId).ifSome((data) => watcher(data));
        }
    }

    /** Unregister a watcher so it is no longer called when certain data is updated */
    public removeWatcher(
        dataId: string,
        watcher: (newValue: unknown) => void,
    ): void {
        const watchers = fromMap(this.watchers, dataId)
            .unwrapOr([])
            .filter((currentWatcher) => currentWatcher !== watcher);
        this.watchers.set(dataId, watchers);
    }

    /** See the current value associated with an ID. However, `addWatcher` should be used instead when possible. */
    public getData(id: string): Option<unknown> {
        return fromMap(this.data, id);
    }

    /** Sets an initial value for data only if the data wasn't already initialized, such as by `loadSavedData` */
    public setDefault(id: string, defaultValue: unknown): void {
        if (!this.data.has(id)) {
            this.updateData(id, defaultValue);
        }
    }

    /** Get all setting IDs */
    public getAllSettingNames(): string[] {
        return [...this.data.keys()];
    }
}
