import { fromMap, Option } from "@nvarner/monads";
import { T2 } from "./Tuple";

class Settings {
    private data: Map<string, unknown>;
    private prefix: string;

    /**
     * @param prefix An arbitrary but unique string that represents this specific settings object in which underscores
     * are prohibited
     */
    public constructor(prefix: string) {
        this.data = new Map();
        this.prefix = prefix;
    }

    protected loadSavedData() {
        if (typeof(Storage) !== "undefined") {
            for (const key in window.localStorage) {
                if (key.startsWith(`${this.prefix}_`)) {
                    const unprefixedKey = key.substring(this.prefix.length + 1);
                    // @ts-ignore: Must exist in localStorage, so not null
                    const data: string = window.localStorage.getItem(key);
                    this.updateData(unprefixedKey, JSON.parse(data));
                }
            }
        }
    }

    protected updateData(id: string, data: unknown): void {
        this.data.set(id, data);
        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem(`${this.prefix}_${id}`, JSON.stringify(data));
        }
    }

    protected getData(id: string): Option<unknown> {
        return fromMap(this.data, id);
    }
    
    setDefault(id: string, defaultValue: unknown): void {
        if (!this.data.has(id)) {
            this.updateData(id, defaultValue);
        }
    }

    public getAllSettingNames(): string[] {
        return [...this.data.keys()];
    }
}

class MutableSettings extends Settings {
    private watchers: Map<string, Watcher[]>;

    /**
     * @param prefix An arbitrary but unique string that represents this specific settings object
     */
    public constructor(prefix: string) {
        super(prefix);
        this.watchers = new Map();
        super.loadSavedData();
    }

    public updateData(id: string, data: any): void {
        super.updateData(id, data);
        fromMap(this.watchers, id).ifSome(watchers => watchers.forEach(watcher => watcher.onChange(data)));
    }

    public addWatcher(dataId: string, watcher: Watcher): void {
        const watchersForId = fromMap(this.watchers, dataId).unwrapOr([]);
        watchersForId.push(watcher);
        this.watchers.set(dataId, watchersForId);

        super.getData(dataId).ifSome((data) => watcher.onChange(data));
    }

    public removeWatcher(dataId: string, watcher: Watcher): void {
        const watchers = fromMap(this.watchers, dataId)
            .unwrapOr([])
            .filter(currentWatcher => currentWatcher !== watcher);
        this.watchers.set(dataId, watchers);
    }
}

export class Watcher {
    private changeHandler: (newValue: unknown) => void;

    constructor(changeHandler: (newValue: unknown) => void) {
        this.changeHandler = changeHandler;
    }

    public onChange(newValue: unknown): void {
        this.changeHandler(newValue);
    }
}

class ImmutableSettings extends Settings {
    public constructor(prefix: string, settings: Map<string, unknown>) {
        super(prefix);
        settings.forEach((data, id) => {
            super.updateData(id, data);
        });
        // Don't load saved data
        // TODO: Maybe saving should be mutable only?
    }

    getSetting(dataId: string): Option<unknown> {
        return super.getData(dataId);
    }
}

// Settings about the settings that should be hidden and immutable to the user without using browser developer tools.
const metaSettingsData = new Map();

// Which settings should not be shown to the user
metaSettingsData.set("hidden-settings", [
    "pd1",
    "pd2",
    "pd3",
    "pd4",
    "pd5",
    "pd6",
    "pd7",
    "pd8",
    "hr"
]);

export const settingInputType: Map<string, string> = new Map();
settingInputType.set("bathroom-gender", "dropdown");

export const dropdownData: Map<string, T2<string, string>[]> = new Map();
dropdownData.set("bathroom-gender", [T2.new("", "no-selection"), T2.new("Man", "m"), T2.new("Woman", "w")]);

export const settingCategories: Map<string, string[]> = new Map();
settingCategories.set("Personal", ["bathroom-gender"]);
settingCategories.set("Visibility", ["show-infrastructure", "show-emergency", "hiding-location"]);
settingCategories.set("Advanced", ["synergy", "dev", "logger", "show-markers"]);

export const infrastructureTags: Set<string> = new Set();
infrastructureTags.add("bsc");
infrastructureTags.add("ec");
infrastructureTags.add("ahu");
infrastructureTags.add("idf");
infrastructureTags.add("mdf");

export const emergencyTags: Set<string> = new Set();
emergencyTags.add("aed");
emergencyTags.add("bleed-control");

// Maps setting IDs to user friendly names
const nameMapping = new Map();
nameMapping.set("bathroom-gender", "Restroom gender (not yet implemented)");
nameMapping.set("synergy", "Enable Synergy Panel (alpha)");
nameMapping.set("dev", "Developer Mode");
nameMapping.set("hiding-location", "Hide Location Dot");
nameMapping.set("show-infrastructure", "Show Infrastructure Icons");
nameMapping.set("show-emergency", "Show Emergency Icons");
nameMapping.set("logger", "Show Logger");
nameMapping.set("show-markers", "Show Markers");
metaSettingsData.set("name-mapping", nameMapping);

export const metaSettings = new ImmutableSettings("meta", metaSettingsData);

// The only places that should update settings are right below here, to set defaults, and in the Settings sidebar code,
// to allow the user to change them.
export const settings = new MutableSettings("settings");
settings.setDefault("bathroom-gender", "no-selection");
settings.setDefault("dev", false);
settings.setDefault("synergy", false);
settings.setDefault("hiding-location", false);
settings.setDefault("show-infrastructure", false);
settings.setDefault("show-emergency", false);
settings.setDefault("logger", false);
settings.setDefault("show-markers", true);
settings.setDefault("pd1", "");
settings.setDefault("pd2", "");
settings.setDefault("pd3", "");
settings.setDefault("pd4", "");
settings.setDefault("pd5", "");
settings.setDefault("pd6", "");
settings.setDefault("pd7", "");
settings.setDefault("pd8", "");
settings.setDefault("hr", "");
