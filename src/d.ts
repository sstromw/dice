import { Roll } from './roll';
import { DefaultMap, SampleSpace } from './sample_space';

export class D extends Roll {
    constructor(readonly n: number) {
        super();
        this.n = n;
    }
    
    toString() { return `d${this.n}`; }

    roll() {
        return 1 + Math.floor(Math.random() * this.n);
    }

    density() {
        let M = new DefaultMap();
        for (let k = 1; k <= this.n; k++) {
            M.set(k, 1/this.n);
        }
        return M;
    }

    mean() { return (this.n + 1)/2; }
    variance() { return (this.n**2 - 1)/12; }
}

export class Const extends Roll {
    constructor(readonly val: number) {
        super();
        this.val = val;
    }

    toString() { return this.val.toString(); }
    roll() { return this.val; }
    density() { return new DefaultMap([[this.val, 1]]); }
    mean() { return this.val; }
    variance() { return 0; }
}