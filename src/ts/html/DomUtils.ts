export class DomUtils {
    public static clearChildren(parent: HTMLElement): void {
        while (parent.firstChild !== null) {
            parent.removeChild(parent.firstChild);
        }
    }
}
