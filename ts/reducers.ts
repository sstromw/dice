import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

abstract class AssociativeReduction extends Roll {
    constructor(readonly children: Roll[],
                readonly op: (lst: number[]) => number,
                readonly symbol: string) {
        super();
        this.children = children;
        this.op = op;
        this.symbol = symbol;
    }

    roll() {
        return this.op(this.children.map((r) => r.roll()));
    }

    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        let A = this.children[0].sample_space();
        for(let i = 1; i < this.children.length; i++) {
            let b = new Map<number, number>();
            for (let [u,p] of A) {
                for (let [v,q] of this.children[i].sample_space()) {
                    let x = this.op([u,v]);
                    b.set(x, p*q + (b.get(x) || 0));
                }
            }
            A = new SampleSpace(b);
        }
        this._sample_space = A;
        return this._sample_space;
    }

    toString() {
        let strs = this.children.map((r) => r.toString()).join(',');
        return `${this.symbol}(${strs})`;
    }
}

let _sum = (M: number[]) => M.reduce((a,b) => a+b, 0);
export class Sum extends AssociativeReduction {
    constructor(readonly rolls: Roll[]) {
        super(rolls, _sum, "Sum");
        this.rolls = rolls;
    }

    mean() { return _sum(this.rolls.map((R) => R.mean())); }
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
        return this.children.map((r) => r.toString()).join(' >> ');
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

    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        let A = new Map<number, number>();
        for (let [k,v] of this.R.sample_space()) {
            let x = this.op(k);
            A.set(x, v + (A.get(x) || 0))
        }
        this._sample_space = new SampleSpace(A);
        return this._sample_space;
    }
}

export class Abs extends UnivariateMap {
    constructor(readonly R: Roll) {
        super(R, Math.abs);
        this.R = R;
    }

    toString() { return `|${this.R}|`; }
}

export class Mod extends UnivariateMap {
    constructor(readonly R: Roll, readonly n: number) {
        super(R, (x) => x%n);
        this.R = R;
        this.n = n;
    }

    toString() { return `${this.R}%${this.n}`; }
}

// A floor division
export class Div extends UnivariateMap {
    constructor(readonly R: Roll, readonly n: number) {
        super(R, (x) => Math.floor(x/n));
        this.R = R;
        this.n = n;
    }

    toString() { return `${this.R}%${this.n}`; }
}