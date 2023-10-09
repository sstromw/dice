import { Roll } from './roll';
import { SampleSpace } from './sample_space';

export class D extends Roll {
    constructor(readonly n: number) {
        super();
        this.n = n;
    }

    roll() {
        return Math.floor(Math.random() * this.n) + 1;
    }

    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        var kv = new Map<number, number>();
        Array.from(Array(this.n).keys()).forEach(x => { kv.set(x+1, 1/this.n); });
        this._sample_space = new SampleSpace(kv);
        return this._sample_space;
    }
}