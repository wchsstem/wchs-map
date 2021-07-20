export type Props = {
    [name: string]: unknown;
};

export interface ElementCreator {
    create(
        tag: string,
        props: Props | null,
        children: HTMLElement[],
    ): HTMLElement;
}
