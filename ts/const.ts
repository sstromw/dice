import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

export class Const extends Roll {
    constructor(readonly val: number) {
        super();
        this.val = val;
    }

    roll() { return this.val; }

    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(new Map([[this.val, 1]]));
        return this._sample_space;
    }

    mean() { return this.val; }
    variance() { return 0; }

    toString() { return this.val; }
}