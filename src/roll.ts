import { DefaultMap, SampleSpace } from "./sample_space";

export abstract class Roll {
    abstract toString(): string;
    abstract roll(): number;
    abstract eq(other: Roll): boolean;

    // Set up lazy pdf evaluation since it's *usually* finite
    protected abstract density(): DefaultMap;
    _sample_space: SampleSpace | undefined;
    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(this.density());
        return this._sample_space;
    }

    pdf(n: number): number { return this.sample_space().pdf(n); }
    cdf(n: number): number { return this.sample_space().cdf(n); }

    // TODO figure out how to make this iterable too.

    mean(): number {
        let s = 0;
        for (let [k,p] of this.sample_space()) {
            s += p*k;
        }
        return s;
    }

    variance(): number {
        let mu = this.mean();
        let s = 0;
        for (let [k,p] of this.sample_space()) {
            s += p * (k-mu)**2;
        }
        return s;
    }

    // So medians aren't unique, but shut up. We're returning the smallest median.
    median() { return this.inverse_cdf(0.5); }

    inverse_cdf(q: number): number {
        if (q < 0 || q > 1) {
            throw new Error(`invalid call to inverse_cdf: ${q}`);
        }
        for (let [k,_] of this.sample_space()) {
            if (this.cdf(k) >= q) return k;
        }
        throw new Error("this shouldn't be possible");
    }
}

export class D extends Roll {
    constructor(readonly n: number) {
        super();
        this.n = n;
    }
    
    toString() { return `d${this.n}`; }

    roll() {
        return 1 + Math.floor(Math.random() * this.n);
    }

    eq(t: D) { return t.n == this.n; }

    density() {
        let M = new DefaultMap();
        for (let k = 1; k <= this.n; k++) {
            M.set(k, 1/this.n);
        }
        return M;
    }

    mean() { return (this.n + 1)/2; }
    variance() { return (this.n**2 - 1)/12; }
    median() { return Math.round((this.n + (this.n % 2)) / 2); }
}

export class Const extends Roll {
    constructor(readonly val: number) {
        super();
        this.val = val;
    }

    toString() { return this.val.toString(); }
    roll() { return this.val; }
    eq(t: Const) { return t.val == this.val; }
    density() { return new DefaultMap([[this.val, 1]]); }
    mean() { return this.val; }
    variance() { return 0; }
    median() { return this.val; }
    inverse_cdf(q: number) { return this.val; }
}

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
        for(i=1; Math.random() > this.p; i++);
        return i;
    }

    eq(t: Geometric) { return t.p == this.p; }

    density() { return new DefaultMap(); }  // This should never be called
    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(
            (n) => n>0 ? Math.pow(1-this.p, n-1) * this.p: 0,
            (n) => n>0 ? 1 - Math.pow(1-this.p, n) : 0
        )
        return this._sample_space;
    }

    mean() { return 1/this.p; }
    variance() { return (1-this.p) / this.p**2; }
    median() { return Math.ceil(-1/Math.log2(1-this.p)); }

    inverse_cdf(q: number) {
        return Math.log(1-q) / Math.log(1-this.p);
    }

    toString() { return `G(${this.p})`; }
}