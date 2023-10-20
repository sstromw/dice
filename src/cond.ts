import { Roll, Coin } from "./roll";
import { DefaultMap, SampleSpace } from "./sample_space";

export class Cond extends Roll {
    constructor(readonly condition: Coin,
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

    eq(t: Cond) {
        return this.condition.eq(t.condition)
            && this.success.eq(t.success)
            && this.failure.eq(t.failure);
    }

    mean() {
        return this.condition.p * this.success.mean() +
               (1-this.condition.p) * this.failure.mean();
    }

    density() {
        let A = new DefaultMap();
        let p = this.condition.p;
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

    eq(t: Or) {
        throw new Error("not implemented");
        return false;
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
        return this.rolls.reduce((a,r) => a+r.roll(), 0) / this.length;
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

    eq(t: Eq) {
        return (this.left.eq(t.left) && this.right.eq(t.right))
            || (this.right.eq(t.left) && this.left.eq(t.right));
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
        super((x,y) => x != y, left, right, "!=");
    }

    eq(t: Ne) {
        return (this.left.eq(t.left) && this.right.eq(t.right))
            || (this.right.eq(t.left) && this.left.eq(t.right));
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

    eq(t: Gt) {
        return this.left.eq(t.left) && this.right.eq(t.right);
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
        super((x,y) => x <= y, left, right, "<=");
    }

    eq(t: Le) {
        return this.left.eq(t.left) && this.right.eq(t.right);
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

    eq(t: Lt) {
        return this.left.eq(t.left) && this.right.eq(t.right);
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
        super((x,y) => x >= y, left, right, ">=");
    }

    eq(t: Ge) {
        return this.left.eq(t.left) && this.right.eq(t.right);
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