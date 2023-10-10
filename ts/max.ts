import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

export class Max extends Roll {
    constructor(readonly children: Array<Roll>) {
        super();
        this.children = children;
    }

    roll() {
        let s = Number.MIN_SAFE_INTEGER;
        this.children.forEach(r => { s = Math.max(r.roll(), s); });
        return s;
    }

    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        let cdf = (n: number) => this.children.reduce((p, r) => p*r.cdf(n), 1);
        this._sample_space = new SampleSpace(undefined, cdf);
        return this._sample_space;
    }

    toString() {
        return this.children.map((r) => r.toString()).join(' << ');
    }
}