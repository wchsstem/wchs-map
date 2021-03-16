import { Control, Map, PanelOptions } from "leaflet";
import { genPaneElement } from "../GenHtml/GenHtml";
import { None, Option, Some } from "@nvarner/monads";
import { h } from "../ts/JSX";

export class Logger {
    private queue: string[];
    private logPane: Option<LogPane>;

    private constructor(queue: string[], logPane: Option<LogPane>) {
        this.queue = queue;
        this.logPane = logPane;
    }

    public static new(): Logger {
        return new Logger([], None);
    }

    public log(logData: string): void {
        this.logPane.match({
            some: logPane => { logPane.log(logData) },
            none: () => { this.queue.push(logData) }
        });
    }

    public associateWithLogPane(logPane: LogPane): void {
        this.queue.forEach(queued => logPane.log(queued));
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