export class MapUrlPos {
    public constructor(
        public xCoord: number,
        public yCoord: number,
        public floorNum: number,
    ) {
        this.validateNums();
    }

    protected validateNums(): void {
        if (this.xCoord < 0 || this.yCoord < 0)
            throw new Error("Coordinate value cannot be negative");

        if (this.floorNum < 0)
            throw new Error("Floor number cannot be negative");

        if (Math.trunc(this.floorNum) != this.floorNum)
            throw new Error("Floor number cannot be a decimal");
    }
}
