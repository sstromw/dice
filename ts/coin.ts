import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

export class Coin extends Roll {
    constructor(readonly p: number = 0.5) {
        super();
        this.p = p;
    }

    roll() {
        // I feel like I shouldn't need the "? 1 : 0"
        return Math.random() < this.p ? 1 : 0;
    }

    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(
            new Map([[0, 1-this.p], [1, this.p]])
        );
        return this._sample_space;
    }
}