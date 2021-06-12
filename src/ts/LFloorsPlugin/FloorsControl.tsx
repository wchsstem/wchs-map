import { fromMap } from "@nvarner/monads";
import { Control, DomEvent, Util } from "leaflet";
import { h } from "../JSX";
import { zip } from "../utils";

/** Control used to choose the current floor to view */
export class FloorsControl extends Control {
    private readonly controlElement: HTMLElement;
    private readonly floorControls: Map<string, HTMLElement>;

    public constructor(
        floors: string[],
        defaultFloor: string,
        setFloor: (floor: string) => void,
        options?: L.ControlOptions,
    ) {
        super(options);

        [this.controlElement, this.floorControls] = FloorsControl.createElement(
            floors,
            defaultFloor,
            setFloor,
        );
    }

    public initialize(options: L.ControlOptions): void {
        Util.setOptions(this, options);
    }

    public onAdd(_map: L.Map): HTMLElement {
        return this.controlElement;
    }

    /**
     * Set the styling of the control to reflect a new floor being set
     */
    public setFloor(oldFloorNumber: string, newFloorNumber: string): void {
        fromMap(this.floorControls, oldFloorNumber).ifSome((oldControl) =>
            FloorsControl.deselectControl(oldControl),
        );
        fromMap(this.floorControls, newFloorNumber).ifSome((newControl) =>
            FloorsControl.selectControl(newControl),
        );
    }

    /**
     * Create the HTML element representing the control
     * @returns `[controlElement, floorControls]`
     * `controlElement` is the HTML element representing the control. `floorControls` is a mapping from room number to the
     * part of `controlElement` that changes when the floor changes.
     */
    private static createElement(
        floors: string[],
        defaultFloor: string,
        setFloor: (floor: string) => void,
    ): [HTMLElement, Map<string, HTMLElement>] {
        const controls = floors.map(
            (floor) => (<a href="#">{floor}</a>) as HTMLElement,
        );
        zip(floors, controls)
            .filter(([floor, _control]) => floor === defaultFloor)
            .map(([_floor, control]) => FloorsControl.selectControl(control));

        const callbacks = zip(floors, controls).map(
            ([floor, control]) =>
                () => {
                    setFloor(floor);
                    controls.forEach((otherControl) =>
                        FloorsControl.deselectControl(otherControl),
                    );
                    FloorsControl.selectControl(control);
                },
        );

        zip(controls, callbacks).forEach(([control, callback]) =>
            control.addEventListener("click", callback),
        );

        const floorControls = new Map(zip(floors, controls));

        const base = (
            <div class="leaflet-bar leaflet-control leaflet-control-floors" />
        ) as HTMLElement;
        controls.forEach((control) => base.appendChild(control));

        DomEvent.disableClickPropagation(base);
        DomEvent.disableScrollPropagation(base);

        return [base, floorControls];
    }

    private static selectControl(control: HTMLElement): void {
        control.classList.add("selected");
    }

    private static deselectControl(control: HTMLElement): void {
        control.classList.remove("selected");
    }
}
