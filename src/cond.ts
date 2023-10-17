import { Roll } from "./roll";
import { DefaultMap, SampleSpace } from "./sample_space";

export class Coin extends Roll {
    constructor(readonly p: number = 0.5) {
        super();
        if (p < 0 || p > 1) {
            throw new Error("probability out of bounds: " + p);
        }
        this.p = p;
    }

    toString() { return `C(${this.p})`; }  // should be B for Bernoulli

    roll() { return Math.random() < this.p ? 1 : 0; }

    density() {
        return new DefaultMap([[0, 1-this.p], [1, this.p]])
    }

    mean() { return this.p; }
    variance() { return this.p * (1 - this.p); }
}

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