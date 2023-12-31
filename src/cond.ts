import { Roll } from "./roll";
import { DefaultMap, SampleSpace } from "./sample_space";

export class Cond extends Roll {
    constructor(readonly condition: Roll,
                readonly success: Roll,
                readonly failure: Roll) {
        super();
        this.condition = condition;
        this.success = success;
        this.failure = failure;
    }

    toString() {
        return `${this.condition} ? ${this.success} : ${this.failure}`;
    }

    roll() {
        return this.condition.roll() ? 
               this.success.roll() :
               this.failure.roll();
    }

    mean() {
        let p = 1-this.sample_space().cdf(0);
        return p * this.success.mean() +
               (1-p) * this.failure.mean();
    }

    density() {
        let A = new DefaultMap();
        let p = 1-this.condition.sample_space().cdf(0);
        for(let [k,v] of this.success.sample_space()) {
            A.increment(k, p*v);
        }
        for(let [k,v] of this.failure.sample_space()) {
            A.increment(k, (1-p)*v);
        }
        return A;
    }
}

export class Or extends Roll {
    length: number;

    constructor(readonly rolls: Roll[]) {
        super();
        this.rolls = rolls;
        this.length = this.rolls.length;
    }

    toString() {
        return `(${this.rolls.map((R)=>R.toString()).join("|")})`;
    }
    
    roll() {
        let n = Math.floor(Math.random() * this.length);
        return this.rolls[n].roll();
    }

    density() {
        let A = new DefaultMap();
        for (let R of this.rolls) {
            for(let [k,v] of R.sample_space()) {
                A.increment(k, v/this.length);
            }
        }
        return A;
    }

    mean() {
        return this.rolls.reduce((a,r) => a+r.mean(), 0) / this.length;
    }
}

abstract class CompareOp extends Roll {
    constructor(readonly op: (x: number, y: number) => boolean,
                readonly left: Roll,
                readonly right: Roll,
                readonly symbol: string) {
        super();
        this.op = op;
        this.left = left;
        this.right = right;
        this.symbol = symbol;
    }
    
    toString() { return `${this.left} ${this.symbol} ${this.right}`; }
    roll() { return this.op(this.left.roll(), this.right.roll()) ? 1 : 0; }
}

export class Eq extends CompareOp {
    constructor(readonly left: Roll, readonly right: Roll) {
        super((x,y) => x == y, left, right, "=");
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.left.sample_space()) {
            A.increment(1, v * this.right.pmf(k));
        }
        A.set(0, 1-A.get(1));
        return A;
    }
}

export class Ne extends CompareOp {
    constructor(readonly left: Roll, readonly right: Roll) {
        super((x,y) => x != y, left, right, "&#8800;");
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.left.sample_space()) {
            A.increment(0, v * this.right.pmf(k));
        }
        A.set(1, 1-A.get(0));
        return A;
    }
}

export class Gt extends CompareOp {
    constructor(readonly left: Roll, readonly right: Roll) {
        super((x,y) => x > y, left, right, ">");
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.left.sample_space()) {
            A.increment(1, v * this.right.cdf(k-1));
        }
        A.set(0, 1-A.get(1));
        return A;
    }
}

export class Le extends CompareOp {
    constructor(readonly left: Roll, readonly right: Roll) {
        super((x,y) => x <= y, left, right, "&#8804;");
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.left.sample_space()) {
            A.increment(0, v * this.right.cdf(k-1));
        }
        A.set(1, 1-A.get(0));
        return A;
    }
}

export class Lt extends CompareOp {
    constructor(readonly left: Roll, readonly right: Roll) {
        super((x,y) => x < y, left, right, "<");
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.left.sample_space()) {
            A.increment(1, v * (1-this.right.cdf(k)));
        }
        A.set(0, 1-A.get(1));
        return A;
    }
}

export class Ge extends CompareOp {
    constructor(readonly left: Roll, readonly right: Roll) {
        super((x,y) => x >= y, left, right, "&#8805;");
    }

    density() {
        let A = new DefaultMap();
        for (let [k,v] of this.left.sample_space()) {
            A.increment(0, v * (1-this.right.cdf(k)));
        }
        A.set(1, 1-A.get(0));
        return A;
    }
}