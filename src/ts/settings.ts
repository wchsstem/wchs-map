import { fromMap, Option } from "@nvarner/monads";
import { T2 } from "./Tuple";

class Settings {
    private data: Map<string, unknown>;
    private prefix: string;
    private watchers: Map<string, Watcher[]>;

    /**
     * @param prefix An arbitrary but unique string that represents this specific settings object in which underscores
     * are prohibited
     */
    public constructor(prefix: string) {
        this.data = new Map();
        this.prefix = prefix;
        this.watchers = new Map();
        this.loadSavedData();
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

    public updateData(id: string, data: unknown): void {
        this.data.set(id, data);
        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem(`${this.prefix}_${id}`, JSON.stringify(data));
        }
        fromMap(this.watchers, id).ifSome(watchers => watchers.forEach(watcher => watcher.onChange(data)));
    }

    public addWatcher(dataId: string, watcher: Watcher, callOnAdd: boolean = true): void {
        const watchersForId = fromMap(this.watchers, dataId).unwrapOr([]);
        watchersForId.push(watcher);
        this.watchers.set(dataId, watchersForId);

        if (callOnAdd) {
            this.getData(dataId).ifSome((data) => watcher.onChange(data));
        }
    }

    public removeWatcher(dataId: string, watcher: Watcher): void {
        const watchers = fromMap(this.watchers, dataId)
            .unwrapOr([])
            .filter(currentWatcher => currentWatcher !== watcher);
        this.watchers.set(dataId, watchers);
    }

    public getData(id: string): Option<unknown> {
        return fromMap(this.data, id);
    }
    
    public setDefault(id: string, defaultValue: unknown): void {
        if (!this.data.has(id)) {
            this.updateData(id, defaultValue);
        }
    }

    public getAllSettingNames(): string[] {
        return [...this.data.keys()];
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

/**
 * Indicates the control type that should be used for a certain setting.
 * Key:
 *  - dropdown: dropdown to choose between the finite set of options specified in `DROPDOWN_DATA`
 */
export const SETTING_INPUT_TYPE: Map<string, string> = new Map();
SETTING_INPUT_TYPE.set("bathroom-gender", "dropdown");

/**
 * Indicates the finite set of dropdown options in the order they should be displayed.
 */
export const DROPDOWN_DATA: Map<string, T2<string, string>[]> = new Map();
DROPDOWN_DATA.set("bathroom-gender", [T2.new("", "no-selection"), T2.new("Man", "m"), T2.new("Woman", "w")]);

/**
 * Defines the order and contents of sections in the settings menu. The first entry of each element is the title of the
 * section, and the second is a list of the options available in that section.
 */
export const SETTING_SECTIONS: [string, string[]][] = [
    ["Personal", ["bathroom-gender"]],
    ["Visibility", ["show-closed", "show-infrastructure", "show-emergency", "hiding-location"]],
    ["Advanced", ["synergy", "dev", "logger", "show-markers"]]
];

export const INFRASTRUCTURE_TAGS: Set<string> = new Set(["bsc", "ec", "ahu", "idf", "mdf"]);

export const EMERGENCY_TAGS: Set<string> = new Set(["aed", "bleed-control"]);

export const NAME_MAPPING = new Map([
    ["bathroom-gender", "Restroom Gender"],
    ["synergy", "Enable Synergy Panel (alpha)"],
    ["dev", "Developer Mode"],
    ["hiding-location", "Hide Location Dot"],
    ["show-closed", "Show Closed Room Icons"],
    ["show-infrastructure", "Show Infrastructure Icons"],
    ["show-emergency", "Show Emergency Icons"],
    ["logger", "Show Logger"],
    ["show-markers", "Show Markers"]
]);

// The only places that should update settings are right below here, to set defaults, and in the Settings sidebar code,
// to allow the user to change them.
export const settings = new Settings("settings");
settings.setDefault("bathroom-gender", "no-selection");
settings.setDefault("dev", false);
settings.setDefault("synergy", false);
settings.setDefault("hiding-location", false);
settings.setDefault("show-closed", false);
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

settings.setDefault("version", "Unknown");
const request = new XMLHttpRequest();
request.onload = () => {
    if (request.status === 200) {
        settings.updateData("version", JSON.parse(request.response)["version"]);
    }
};
request.open("GET", "version.json");
request.send();
