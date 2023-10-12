import { Roll } from './roll';
import { DefaultMap, SampleSpace } from './sample_space';

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
        let M = new DefaultMap();
        for (let k = 1; k <= this.n; k++) {
            M.set(k, 1/this.n);
        }
        this._sample_space = new SampleSpace(M);
        return this._sample_space;
    }

    mean() { return (this.n + 1)/2; }
    variance() { return (this.n**2 - 1)/12; }

    toString() { return `d${this.n}`; }
}

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
        this._sample_space = new SampleSpace(
            new DefaultMap([[this.val, 1]])
        );
        return this._sample_space;
    }

    mean() { return this.val; }
    variance() { return 0; }

    toString() { return this.val.toString(); }
}