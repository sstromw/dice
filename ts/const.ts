import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

export class Const extends Roll {
    constructor(readonly n: number) {
        super();
        this.n = n;
    }

    roll() { return this.n; }

    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(new Map([[this.n, 1]]));
        return this._sample_space;
    }
}