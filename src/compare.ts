import { Roll } from "./roll";
import { DefaultMap, SampleSpace } from "./sample_space";

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
            A.increment(1, v * this.right.pdf(k));
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
            A.increment(0, v * this.right.pdf(k));
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