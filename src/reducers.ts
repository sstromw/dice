import { Roll } from "./roll";
import { DefaultMap, SampleSpace } from "./sample_space";

// This is the equality function for multi-roll reducers. It's complicated
// because Associative actually means Commutative, so order doesn't matter
//
// We can simplify this by enforcing a sorted order to the rolls
function equals<T extends AssociativeReduction | Max>(left: T, right: T) {
    if (left.rolls.length != right.rolls.length) { return false; }

    let I = Array.from(Array(left.rolls.length), (_) => true);
    for (let r of left.rolls) {
        let j = 0;
        let hit = false;
        while (j < left.rolls.length) {
            if (I[j] && r.eq(right.rolls[j])) {
                I[j] = false;
                j = left.rolls.length;
                hit = true;
            }
            j++;
        }
        if (!hit) { return false; }
    }
    return true;
}

abstract class AssociativeReduction extends Roll {
    constructor(readonly rolls: Roll[],
                readonly op: (lst: number[]) => number,
                readonly symbol: string) {
        super();
        this.rolls = rolls;
        this.op = op;
        this.symbol = symbol;
    }

    roll() {
        return this.op(this.rolls.map((r) => r.roll()));
    }

    eq(t: AssociativeReduction) {
        if (this.symbol !== t.symbol) { return false; }
        return equals<AssociativeReduction>(this, t);
    }

    density() {
        let A = this.rolls[0].sample_space();
        for(let i = 1; i < this.rolls.length; i++) {
            let b = new DefaultMap();
            for (let [u,p] of A) {
                for (let [v,q] of this.rolls[i].sample_space()) {
                    let x = this.op([u,v]);
                    b.increment(x, p*q);
                }
            }
            A = new SampleSpace(b);
        }
        return A._pdf as DefaultMap;
    }

    toString() {
        let strs = this.rolls.map((r) => r.toString()).join(',');
        return `${this.symbol}(${strs})`;
    }
}

let _sum = (M: number[]) => M.reduce((a,b) => a+b, 0);
export class Sum extends AssociativeReduction {
    constructor(readonly rolls: Roll[]) {
        super(rolls, _sum, "Sum");
        this.rolls = rolls;
    }

    toString() {
        return this.rolls.map((r) => r.toString()).join(' + ');
    }

    mean() { return _sum(this.rolls.map((R) => R.mean())); }
    variance() { return _sum(this.rolls.map((R) => R.variance())); }
}

// Ok, Mult is a repeated Sum but Prod is a product.
export class Mult extends Sum {
    constructor(readonly n: number, readonly R: Roll) {
        super(Array.from({ length: n }, (_) => R));
        this.R = R;
        this.n = n;
    }

    toString() { return `${this.n}${this.R}`; }
}

let _prod = (M: number[]) => M.reduce((a,b) => a*b, 1);
export class Prod extends AssociativeReduction {
    constructor(readonly rolls: Roll[]) {
        super(rolls, _prod, "Prod");
        this.rolls = rolls;
    }

    // Rolls are independent
    mean() { return _prod(this.rolls.map((R) => R.mean())); }
}

export class Min extends AssociativeReduction {
    constructor(readonly rolls: Roll[]) {
        super(rolls, (R) => Math.min(...R), "Min");
        this.rolls = rolls;
    }
}

// Max can be done more efficiently without the generic
export class Max extends Roll {
    constructor(readonly rolls: Array<Roll>) {
        super();
        this.rolls = rolls;
    }

    roll() {
        let s = Number.MIN_SAFE_INTEGER;
        this.rolls.forEach(r => { s = Math.max(r.roll(), s); });
        return s;
    }

    eq(t: Max) { return equals<Max>(this, t); }

    density() { return new DefaultMap(); }  // Should never be called
    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        let cdf = (n: number) => this.rolls.reduce((p, r) => p*r.cdf(n), 1);
        this._sample_space = new SampleSpace(undefined, cdf);
        return this._sample_space;
    }

    toString() {
        let strs = this.rolls.map((r) => r.toString()).join(',');
        return `Max(${strs})`;
    }
}

abstract class UnivariateMap extends Roll {
    constructor(readonly R: Roll,
                readonly op: (x: number) => number) {
        super();
        this.R = R;
        this.op = op;
    }

    roll() {
        return this.op(this.R.roll());
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.R.sample_space()) {
            let x = this.op(k);
            A.increment(x, v);
        }
        return A;
    }
}

export class Abs extends UnivariateMap {
    constructor(readonly R: Roll) {
        super(R, Math.abs);
        this.R = R;
    }

    toString() { return `|${this.R}|`; }
    eq(t: Abs) { return this.R.eq(t.R); }
}

export class Neg extends UnivariateMap {
    constructor(readonly R: Roll) {
        super(R, (x)=>-x);
        this.R = R;
    }

    toString() { return `-${this.R}`; }
    eq(t: Neg) { return this.R.eq(t.R); }
}

export class Mod extends UnivariateMap {
    constructor(readonly R: Roll, readonly n: number) {
        super(R, (x) => x%n);
        this.R = R;
        this.n = n;
    }

    toString() { return `${this.R}%${this.n}`; }
    eq(t: Mod) { return this.R.eq(t.R) && this.n == t.n; }
}

// A floor division
export class Div extends UnivariateMap {
    constructor(readonly R: Roll, readonly n: number) {
        super(R, (x) => Math.floor(x/n));
        this.R = R;
        this.n = n;
    }

    toString() { return `${this.R}/${this.n}`; }
    eq(t: Div) { return this.R.eq(t.R) && this.n == t.n; }
}