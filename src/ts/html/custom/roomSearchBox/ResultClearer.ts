export class ResultClearer {
    private readonly clearFunctions: (() => void)[];

    public constructor() {
        this.clearFunctions = [];
    }

    public linkRoomSearchBox(clearFunction: () => void): void {
        this.clearFunctions.push(clearFunction);
    }

    public clear(): void {
        this.clearFunctions.forEach((clear) => clear());
    }
}
