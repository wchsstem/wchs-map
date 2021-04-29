import { Pane } from "../Pane";
import { h } from "../../JSX";
import { DROPDOWN_DATA, NAME_MAPPING, settings, SETTING_INPUT_TYPE, SETTING_SECTIONS, Watcher } from "../../settings";
import { fromMap, Option, Some, None } from "@nvarner/monads";
import { genPaneElement, genTextInput } from "../../GenHtml/GenHtml";
import { T2 } from "../../Tuple";

export class SettingsPane extends Pane {
    private readonly pane: HTMLElement;

    public constructor() {
        super();

        const settingsContainer = <ul class="wrapper settings-container" />;

        SETTING_SECTIONS.forEach(([category, categorySettings]) => {
            const categorySettingsContainer = <ul />;

            categorySettings.forEach(name => {
                const container = <li class="setting-container"></li>;
                categorySettingsContainer.appendChild(container);

                const watcher = new Watcher(data => {
                    while (container.firstChild !== null) {
                        container.removeChild(container.firstChild);
                    }

                    let setting = null;
                    if (typeof data === "string") {
                        const inputType = fromMap(SETTING_INPUT_TYPE, name);
                        const maybeSetting: Option<HTMLElement> = inputType.match({
                            some: (type) => {
                                if (type === "dropdown") {
                                    // Assume exists
                                    const optionDisplayAndIds = fromMap(DROPDOWN_DATA, name).unwrap();
                                    return Some(SettingsPane.createDropdownSetting(name, data, optionDisplayAndIds, NAME_MAPPING));
                                } else {
                                    return None;
                                }
                            },
                            none: () => None
                        });
                        setting = maybeSetting.match({
                            some: (s) => s,
                            none: () => SettingsPane.createStringSetting(name, data, NAME_MAPPING)
                        });
                    } else if (typeof data === "boolean") {
                        setting = SettingsPane.createBooleanSetting(name, data, NAME_MAPPING);
                    }
                    if (setting !== null) {
                        container.appendChild(setting);
                    }
                });
                settings.addWatcher(name, watcher);
            });

            const categoryContainer = <li>
                <h2>{category}</h2>
                {categorySettingsContainer}
            </li>;
            settingsContainer.appendChild(categoryContainer);
        });

        const versionContainer = <li />;
        settings.addWatcher("version", new Watcher(version => versionContainer.innerText = `Version: ${version}`));

        const aboutContainer = <li>
            <h2>About</h2>
            <ul>
                {versionContainer}
            </ul>
        </li>;
        settingsContainer.appendChild(aboutContainer);

        this.pane = genPaneElement("Settings", settingsContainer);
    }

    public getPaneId(): string {
        return "settings";
    }

    public getPaneIconClass(): string {
        return "fa-cog";
    }

    public getPaneTitle(): string {
        return "Settings";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }

    public getPosition(): "top" | "bottom" {
        return "bottom";
    }

    private static createSetting(name: string, control: HTMLElement): HTMLDivElement {
        return <div>
            <label>{name}</label>
            {control}
        </div>;
    }

    private static createStringSetting(name: string, value: string, nameMapping: Map<string, string>): HTMLDivElement {
        const control = genTextInput("", value);
        control.addEventListener("change", () => {
            settings.updateData(name, control.value);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return SettingsPane.createSetting(mappedName, control);
    }

    private static createBooleanSetting(name: string, value: boolean, nameMapping: Map<string, string>): HTMLElement {
        const control = <input type="checkbox" />;
        control.checked = value;
        control.addEventListener("change", () => {
            settings.updateData(name, control.checked);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return SettingsPane.createSetting(mappedName, control);
    }

    private static createDropdownSetting(name: string, value: string, optionDisplayAndIds: T2<string, string>[], nameMapping: Map<string, string>): HTMLElement {
        const control = <select />;
        for (const displayAndId of optionDisplayAndIds) {
            const display = displayAndId.e0;
            const id = displayAndId.e1;

            const option = <option value={id}>{display}</option>;
            if (id == value) {
                option.setAttribute("selected", "selected");
            }
            control.appendChild(option);
        }

        control.addEventListener("change", () => {
            settings.updateData(name, control.value);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return SettingsPane.createSetting(mappedName, control);
    }
}