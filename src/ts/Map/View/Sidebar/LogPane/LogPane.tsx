import { Either, Left, None, Option, Right, Some } from "@nvarner/monads";

import { genPaneElement } from "../../../../GenHtml/GenHtml";
import { h } from "../../../../JSX";
import { Pane } from "../Pane";

export class Logger {
    /** Queue for logs to post ASAP; left is normal log, right is error log */
    private queue: Either<string, string>[];
    private logPane: Option<LogPane>;

    public constructor() {
        this.queue = [];
        this.logPane = None;
    }

    public log(logData: string): void {
        this.logPane.match({
            some: (logPane) => {
                logPane.log(logData);
            },
            none: () => {
                this.queue.push(Left(logData));
            },
        });
        console.log(logData);
    }

    public logError(logData: string): void {
        this.logPane.match({
            some: (logPane) => {
                logPane.logError(logData);
            },
            none: () => {
                this.queue.push(Right(logData));
            },
        });
        console.error(logData);
    }

    public associateWithLogPane(logPane: LogPane): void {
        this.queue.forEach((queued) =>
            queued.match({
                left: (logData) => logPane.log(logData),
                right: (logData) => logPane.logError(logData),
            }),
        );
        this.queue = [];
        this.logPane = Some(logPane);
    }
}

export class LogPane extends Pane {
    private readonly logs: HTMLElement;
    private readonly pane: HTMLElement;

    private constructor(logs: HTMLElement, pane: HTMLElement) {
        super();

        this.logs = logs;
        this.pane = pane;
    }

    public static new(): LogPane {
        const logs = <ul />;
        const pane = genPaneElement("Log", logs);

        return new LogPane(logs, pane);
    }

    public log(logData: string): void {
        const logElement = <li>{logData}</li>;
        this.logs.appendChild(logElement);
    }

    public logError(logData: string): void {
        // TODO: Include styling to make these stand out
        const logElement = <li className="error">{logData}</li>;
        this.logs.appendChild(logElement);
    }

    public getPaneId(): string {
        return "log";
    }

    public getPaneIconClass(): string {
        return "fa-stream";
    }

    public getPaneTitle(): string {
        return "Log Pane";
    }

    public getPaneElement(): HTMLElement {
        return this.pane;
    }

    public getPosition(): "top" | "bottom" {
        return "bottom";
    }
}
