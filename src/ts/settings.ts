class Settings {
    private data: Map<string, any>;
    private watchers: Map<string, Watcher[]>;

    constructor() {
        this.data = new Map();
        this.watchers = new Map();

        if (typeof(Storage) !== "undefined") {
            for (const key in window.localStorage) {
                this.updateData(key, JSON.parse(window.localStorage.getItem(key)));
            }
        }
    }

    updateData(id: string, data: any): void {
        this.data.set(id, data);
        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem(id, JSON.stringify(data));
        }

        if (this.watchers.has(id)) {
            for (const watcher of this.watchers.get(id)) {
                watcher.onChange(data);
            }
        }
    }

    setDefault(id: string, defaultValue: any): void {
        if (!this.data.has(id)) {
            this.updateData(id, defaultValue);
        }
    }

    addWatcher(dataId: string, watcher: Watcher): void {
        if (!this.watchers.has(dataId)) {
            this.watchers.set(dataId, []);
        }

        this.watchers.get(dataId).push(watcher);
        watcher.onChange(this.data.get(dataId));
    }

    getAllSettings(): Map<string, any> {
        return this.data;
    }
}

export class Watcher {
    private changeHandler: (newValue: any) => void;

    constructor(changeHandler: (newValue: any) => void) {
        this.changeHandler = changeHandler;
    }

    onChange(newValue: any): void {
        this.changeHandler(newValue);
    }
}

// The only places that should update settings are right below here, to set defaults, and in the Settings sidebar code,
// to allow the user to change them.
export const settings = new Settings();
settings.updateData("setting-display", [
    {
        "id": "dev",
        "display-name": "Developer Mode"
    },
    {
        "id": "hiding-location",
        "display-name": "Hide Location Dot?"
    }
]);
settings.setDefault("dev", false);
settings.setDefault("pd1", "");
settings.setDefault("pd2", "");
settings.setDefault("pd3", "");
settings.setDefault("pd4", "");
settings.setDefault("pd5", "");
settings.setDefault("pd6", "");
settings.setDefault("pd7", "");
settings.setDefault("pd8", "");
settings.setDefault("hr", "");
settings.setDefault("hiding-location", false);
