class Settings {
    private data: Map<string, any>;
    private watchers: Map<string, Watcher[]>;

    constructor() {
        this.data = new Map();
        this.watchers = new Map();
    }

    updateData(id: string, data: any): void {
        this.data.set(id, data);
        if (this.watchers.has(id)) {
            for (const watcher of this.watchers.get(id)) {
                watcher.onChange(data);
            }
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
settings.updateData("Enable Portal Panel (alpha)", false);
settings.updateData("dev", false);
