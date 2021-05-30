import { PanelOptions } from "leaflet";
import { genPaneElement } from "../GenHtml/GenHtml";
import { Either, Left, None, Option, Right, Some } from "@nvarner/monads";
import { h } from "../JSX";

export class Logger {
    /** Queue for logs to post ASAP; left is normal log, right is error log */
    private queue: Either<string, string>[];
    private logPane: Option<LogPane>;

    private constructor(queue: Either<string, string>[], logPane: Option<LogPane>) {
        this.queue = queue;
        this.logPane = logPane;
    }

    public static new(): Logger {
        return new Logger([], None);
    }

    public log(logData: string): void {
        this.logPane.match({
            some: logPane => {
                logPane.log(logData);
            },
            none: () => {
                this.queue.push(Left(logData));
            }
        });
        console.log(logData);
    }

    public logError(logData: string): void {
        this.logPane.match({
            some: logPane => {
                logPane.logError(logData);
            },
            none: () => {
                this.queue.push(Right(logData));
            }
        });
        console.error(logData);
    }

    public associateWithLogPane(logPane: LogPane): void {
        this.queue.forEach(queued => queued.match({
            left: logData => logPane.log(logData),
            right: logData => logPane.logError(logData)
        }));
        this.queue = [];
        this.logPane = Some(logPane);
    }
}

export class LogPane {
    private readonly logs: HTMLElement;
    private readonly pane: HTMLElement;

    private constructor(logs: HTMLElement, pane: HTMLElement) {
        this.logs = logs;
        this.pane = pane;
    }

    public static new(): LogPane {
        const logs = <ul></ul> as HTMLUListElement;
        const pane = genPaneElement("Log", logs);

        return new LogPane(logs, pane);
    }

    public log(logData: string): void {
        const logElement = <li>{ logData }</li>;
        this.logs.appendChild(logElement);
    }

    public logError(logData: string): void {
        // TODO: Include styling to make these stand out
        const logElement = <li class="error">{ logData }</li>;
        this.logs.appendChild(logElement);
    }

    public getId(): string {
        return "log";
    }

    public getPanelOptions(): PanelOptions {
        return {
            id: this.getId(),
            tab: "<i class=\"fas fa-stream\"></i>",
            title: "Log Pane",
            pane: this.pane,
            position: "bottom"
        }
    }
}