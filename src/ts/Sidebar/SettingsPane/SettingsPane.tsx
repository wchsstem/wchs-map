import { Pane } from "../Pane";
import { h } from "../../JSX";
import { NAME_MAPPING, SETTING_INPUT_TYPE, SETTING_SECTIONS } from "../../config";
import { fromMap, Option, Some, None } from "@nvarner/monads";
import { genPaneElement, genTextInput } from "../../GenHtml/GenHtml";
import { ISettings } from "../../settings/ISettings";
import { removeChildren } from "../../utils";

export class SettingsPane extends Pane {
    private readonly settings: ISettings;

    private readonly pane: HTMLElement;

    public constructor(settings: ISettings) {
        super();

        this.settings = settings;

        const settingsContainer = <ul class="wrapper settings-container" />;

        SETTING_SECTIONS.forEach(([category, categorySettings]) => {
            const categorySettingsContainer = <ul/>;

            categorySettings.map(name => {
                const container = <li class="setting-container"></li>;

                settings.addWatcher(name, data => {
                    removeChildren(container);

                    this.createSettingElementFor(name, data)
                        .ifSome(setting => container.appendChild(setting));
                });
                return container;
            }).forEach(container => categorySettingsContainer.appendChild(container));

            const categoryContainer = <li>
                <h2>{category}</h2>
                {categorySettingsContainer}
            </li>;
            settingsContainer.appendChild(categoryContainer);
        });

        // Version injected by versionInjector
        const aboutContainer = <li>
            <h2>About</h2>
            <ul>
                <li>Version: {"[VI]{version}[/VI]"}</li>
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

    private createSettingElementFor(name: string, data: unknown): Option<HTMLElement> {
        let setting: Option<HTMLElement> = None;
        if (typeof data === "string") {
            setting = Some(fromMap(SETTING_INPUT_TYPE, name)
                .andThen(([type, settingData]) => {
                    if (type === "dropdown") {
                        // Assume exists if type is dropdown
                        const optionDisplayAndIds = settingData;
                        return Some(this.createDropdownSetting(name, data, optionDisplayAndIds, NAME_MAPPING));
                    } else {
                        return None;
                    }
                }).unwrapOrElse(() => this.createStringSetting(name, data, NAME_MAPPING)));
        } else if (typeof data === "boolean") {
            setting = Some(this.createBooleanSetting(name, data, NAME_MAPPING));
        }
        return setting;
    }

    private createSetting(name: string, control: HTMLElement): HTMLDivElement {
        return <div>
            <label>{name}</label>
            {control}
        </div>;
    }

    private createStringSetting(name: string, value: string, nameMapping: Map<string, string>): HTMLDivElement {
        const control = genTextInput("", value);
        control.addEventListener("change", () => {
            this.settings.updateData(name, control.value);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return this.createSetting(mappedName, control);
    }

    private createBooleanSetting(name: string, value: boolean, nameMapping: Map<string, string>): HTMLElement {
        const control = <input type="checkbox" />;
        control.checked = value;
        control.addEventListener("change", () => {
            this.settings.updateData(name, control.checked);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return this.createSetting(mappedName, control);
    }

    private createDropdownSetting(
        name: string,
        value: string,
        optionDisplayAndIds: [string, string][],
        nameMapping: Map<string, string>
    ): HTMLElement {
        const control = <select />;
        for (const [display, id] of optionDisplayAndIds) {
            const option = <option value={id}>{display}</option>;
            if (id == value) {
                option.setAttribute("selected", "selected");
            }
            control.appendChild(option);
        }

        control.addEventListener("change", () => {
            this.settings.updateData(name, control.value);
        });

        const mappedName = fromMap(nameMapping, name).unwrapOr(name);
        return this.createSetting(mappedName, control);
    }
}