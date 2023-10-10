import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

export class Geometric extends Roll {
    constructor(readonly p: number) {
        super();
        if (p < 0 || p > 1) {
            throw new Error("probability out of bounds: " + p);
        }
        this.p = p;
    }

    roll() {
        let i: number;
        for(i=0; Math.random() < this.p; i++);
        return i;
    }

    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(
            (n) => Math.pow(1-this.p, n-1) * this.p
        )
        return this._sample_space;
    }

    mean() { return 1/this.p; }
    variance() { return (1-this.p) / this.p**2; }

    toString() { return `G(${this.p})`; }
}