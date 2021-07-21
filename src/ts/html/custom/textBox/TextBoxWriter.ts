/**
 * Writes to text boxes (ie. changing their content). Should be linked by passing an instance as a property.
 */
export class TextBoxWriter {
    private readonly inputs: HTMLInputElement[];

    public constructor() {
        this.inputs = [];
    }

    public linkToInput(input: HTMLInputElement): void {
        this.inputs.push(input);
    }

    public write(contents: string): void {
        this.inputs.forEach((input) => (input.value = contents));
    }
}
