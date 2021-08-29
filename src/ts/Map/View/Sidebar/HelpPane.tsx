import { genPaneElement } from "../../../GenHtml/GenHtml";
import { h } from "../../../JSX";
import { Pane } from "./Pane";

export class HelpPane extends Pane {
    private readonly pane: HTMLElement;

    public static inject = [] as const;
    public constructor() {
        super();

        const contents = (
            <div>
                <h2>Contributors</h2>
                <ul>
                    <li>Nathan Varner '21</li>
                    <li>Nate Hollingsworths '21</li>
                    <li>Elizabeth Qiu '22</li>
                    <li>Samuel Segal '22</li>
                </ul>
                <ul>
                    <p>
                        Have questions or feedback? Let us know at
                        wchsmap@gmail.com
                    </p>
                    <p>
                        Join the Churchill Stem Club by texting "@hellostem" to
                        81010, or by visiting https://rmd.at/hellostem
                    </p>
                </ul>
            </div>
        );
        this.pane = genPaneElement("Help", contents);
    }

    public getPaneId(): string {
        return "help";
    }

    public getPaneIconClass(): string {
        return "fa-question-circle";
    }

    public getPaneTitle(): string {
        return "Help";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }

    public getPosition(): "top" | "bottom" {
        return "bottom";
    }
}
