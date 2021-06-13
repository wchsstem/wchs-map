import { genPaneElement } from "../../../../GenHtml/GenHtml";
import { Geocoder } from "../../../../Geocoder/Geocoder";
import { h } from "../../../../JSX";
import { Logger } from "../../../../LogPane/LogPane";
import { Pane } from "../Pane";
import { Synergy } from "./Synergy";

// 2 MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export class SynergyPane extends Pane {
    private readonly pane: HTMLElement;

    public constructor(geocoder: Geocoder, logger: Logger) {
        super();

        const beta = <p>Currently in alpha. Doesn't fully work yet.</p>;
        const info = (
            <p>Download your Synergy page and upload the HTML file here.</p>
        );

        const siteUpload = <input type="file" accept="text/html" />;

        const errorBox = <p />;
        const courses = <ol />;

        siteUpload.addEventListener("change", () => {
            if (siteUpload.files === null || siteUpload.files.length === 0) {
                return;
            }

            errorBox.innerText = "";

            const file = siteUpload.files[0];
            if (file.type !== "text/html") {
                errorBox.innerText = "Wrong file type uploaded.";
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                errorBox.innerText = "File size is greater than 2 MB.";
                return;
            }

            const reader = new FileReader();

            reader.addEventListener("error", () => {
                errorBox.innerText = "There was an error reading the file.";
            });

            reader.addEventListener("load", (result) => {
                if (result.target === null || result.target.result === null) {
                    errorBox.innerText = "There was an error loading the file.";
                    return;
                }

                const synergyPage = result.target.result.toString();
                const synergy = new Synergy(synergyPage, geocoder, logger);
                for (const course of synergy.getCourses()) {
                    courses.appendChild(course.toHtmlLi());
                }
            });

            reader.readAsText(file);
        });

        this.pane = genPaneElement("Synergy", [
            beta,
            info,
            siteUpload,
            errorBox,
            courses,
        ]);
    }

    public getPaneId(): string {
        return "synergy";
    }

    public getPaneIconClass(): string {
        return "fa-sign-in-alt";
    }

    public getPaneTitle(): string {
        return "Synergy";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }
}
