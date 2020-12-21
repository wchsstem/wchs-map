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

    /**
     * Should be used very rarely; always use addWatcher when possible!
     */
    getSetting(dataId: string): any {
        return this.data.get(dataId);
    }

    addWatcher(dataId: string, watcher: Watcher): void {
        if (!this.watchers.has(dataId)) {
            this.watchers.set(dataId, []);
        }

        this.watchers.get(dataId).push(watcher);
        watcher.onChange(this.data.get(dataId));
    }

    removeWatcher(dataId: string, watcher: Watcher): void {
        const watchers = this.watchers.get(dataId).filter(currentWatcher => currentWatcher !== watcher);
        this.watchers.set(dataId, watchers);
    }

    getAllSettingNames(): string[] {
        return [...this.data.keys()];
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

// This is a special setting that maps the setting IDs to user friendly names. It is not displayed in the sidebar.
settings.updateData("name-mapping", {
    "synergy": "Enable Synergy Panel (alpha)",
    "dev": "Developer Mode"
});

settings.updateData("synergy", false);
settings.updateData("dev", false);
