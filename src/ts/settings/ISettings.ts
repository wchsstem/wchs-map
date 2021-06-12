import { Option } from "@nvarner/monads";

/**
 * Stores and manages mutable program state that can change at runtime and persists between page reloads. Allows
 * watchers to be notified when data changes.
 */
export interface ISettings {
    /** Sets the data stored at `id` to the new `data`. Calls relevant watchers. */
    updateData(id: string, data: unknown): void;

    /**
     * Register a function to call when certain data changes and call that function immediately after registering it
     * @param dataId ID to watch for changes on
     * @param watcher Function to call when data changes
     */
    addWatcher(dataId: string, watcher: (newValue: unknown) => void): void;

    /**
     * Register a function to call when certain data changes
     * @param dataId ID to watch for changes on
     * @param watcher Function to call when data changes
     * @param callOnAdd If true, calls the watcher immediately after registering it
     */
    addWatcher(
        dataId: string,
        watcher: (newValue: unknown) => void,
        callOnAdd: boolean,
    ): void;

    /** Unregister a watcher so it is no longer called when certain data is updated */
    removeWatcher(dataId: string, watcher: (newValue: unknown) => void): void;

    /** See the current value associated with an ID. However, `addWatcher` should be used instead when possible. */
    getData(id: string): Option<unknown>;

    /** Sets an initial value for data only if the data wasn't already initialized */
    setDefault(id: string, defaultValue: unknown): void;

    /** Get all setting IDs */
    getAllSettingNames(): string[];
}
