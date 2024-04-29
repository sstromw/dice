import { DefaultMap, SampleSpace } from "./sample_space";

export abstract class Roll {
    abstract toString(): string;
    abstract roll(): number;

    // Set up lazy pmf evaluation since it's *usually* finite
    protected abstract density(): DefaultMap;
    _sample_space: SampleSpace | undefined;
    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(this.density());
        return this._sample_space;
    }

    pmf(n: number): number { return this.sample_space().pmf(n); }
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
    stdev(): number {
        return Math.sqrt(this.variance());
    }

    // So medians aren't unique, but shut up. We're returning the smallest median.
    median() { return this.inverse_cdf(0.5); }

    inverse_cdf(q: number): number {
        if (q < 0 || q > 1) {
            throw new Error(`invalid call to inverse_cdf: ${q}`);
        }
        for (let [k,_] of this.sample_space()) {
            // We account for floating point errors here
            if (this.cdf(k) - q > -1e-8) return k;
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
    density() { return new DefaultMap([[this.val, 1]]); }
    mean() { return this.val; }
    variance() { return 0; }
    median() { return this.val; }
    inverse_cdf(q: number) { return this.val; }
}

export class Coin extends Roll {
    constructor(readonly p: number = 0.5) {
        super();
        if (p < 0 || p > 1) {
            throw new Error("probability out of bounds: " + p);
        }
        this.p = p;
    }

    toString() { return `C(${this.p.toPrecision(2)})`; }  // should be B for Bernoulli

    roll() { return Math.random() < this.p ? 1 : 0; }

    density() {
        return new DefaultMap([[0, 1-this.p], [1, this.p]])
    }

    mean() { return this.p; }
    variance() { return this.p * (1 - this.p); }
    median() { return this.p <= 0.5 ? 0 : 1; }

    inverse_cdf(q: number) { return q >= this.p ? 1 : 0; }
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

    density() { return new DefaultMap(); }  // This should never be called
    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(
            (n) => n>0 ? Math.pow(1-this.p, n-1) * this.p: 0,
            (n) => n>0 ? 1 - Math.pow(1-this.p, n) : 0
        );
        return this._sample_space;
    }

    mean() { return 1/this.p; }
    variance() { return (1-this.p) / this.p**2; }
    median() { return Math.ceil(-1/Math.log2(1-this.p)); }

    inverse_cdf(q: number) {
        return Math.ceil(Math.log(1-q) / Math.log(1-this.p));
    }

    toString() { return `G(${this.p.toPrecision(2)})`; }
}

export class Poisson extends Roll {
    
    constructor(readonly rate: number) {
        super();
        if (rate <= 0) {
            throw new Error(`rate out of bounds: ${rate}`);
        }
        this.rate = rate;
    }

    _fact(n: number): number { return (n == 0) ? 1 : n * this._fact(n-1); }
    roll() {
        // If rate is high, use alternate strategy
        if (this.rate > 30) {
            let c = 0.767 - 3.36 / this.rate;
            let beta = Math.PI / Math.sqrt(3 * this.rate)
            let alpha = beta * this.rate;
            let k = Math.log(c) - Math.log(beta) - this.rate
            while (true) {
                let u = Math.random()
                let x = (alpha - Math.log((1-u)/u)) / beta
                let n = Math.floor(x + 0.5)
                if (n >= 0) {
                    let v = Math.random()
                    let y = alpha - beta*x
                    if (y + Math.log(v/(1.+Math.exp(y))**2) <=
                        k + n*Math.log(this.rate) - Math.log(this._fact(n))) {
                            return n
                    }
                }
            }
        }
        let L = Math.exp(-this.rate);
        let k = 1;
        let p = Math.random();
        while (p > L) {
            p *= Math.random();
            k++;
        }
        return k-1;
    }

    density() { return new DefaultMap(); }  // This should never be called
    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace((k) => {
            if (k < 0) return 0;
            if (k == 0) return Math.exp(-this.rate);
            let p = 1;
            let x = Math.exp(-this.rate / k);
            for (let i = 1; i < k+1; i++) {
                p *= this.rate * x / i;
            }
            return p;
        });
        return this._sample_space;
    }

    mean() { return this.rate; }
    variance() { return this.rate; }

    toString() { return `Pois(${this.rate})`; }
}

export class CouponCollector extends Roll {
    // If you repeatedly draw one of N options, this random variable represents
    // the number of draws it takes to get all options at least once.
    constructor(readonly n: number) {
        super();
        this.n = n;
    }
    
    toString() { return `CouponCollector(${this.n})`; }

    roll() {
        let X = Array.from({ length: this.n }, (_) => true);
        let count = this.n;
        let draws = 0;
        while (count > 0) {
            draws += 1;
            let i = Math.floor(Math.random() * this.n);
            if (X[i]) {
                X[i] = false;
                count -= 1;
            }
        }
        return draws;
    }

    // This is a binomial coefficient cache
    _cache: Array<number>;
    density() { return new DefaultMap(); }
    sample_space() {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        // P[T=t] = n!/n^t {t-1 n-1}
        //        = n!/n^t (1/(n-1)! sum_{i=1..n-1} (-1)^(n-1-i) (n-1 i) i^(t-1))
        //        = n/n^t sum_{i=1..n-1} (-1)^(n-1-i) (n-1 i) i^(t-1)
        //        = sum_{i=1..n-1} (-1)^(n-1-i) (n-1 i) (i/n)^(t-1)
        this._cache = Array.from({length: this.n-1 });
        let num = this.n % 2 ? 1 : -1;
        let den = 1;
        for (let i = 1; i < this.n; i += 1) {
            num *= i - this.n
            den *= i
            this._cache[i-1] = num / den;
        }
        this._sample_space = new SampleSpace(
            (t) => {
                if (t < this.n) {
                    return 0;
                }
                let p = 0;
                for (let i = 1; i < this.n; i += 1) {
                    p += this._cache[i-1] * Math.pow(i/this.n, t-1);
                }
                return p;
            },
        );
        return this._sample_space;
    }

    mean() {
        let s = 0;
        for (let i = 1; i <= this.n; i++) {
            s += 1/i;
        }
        return s * this.n;
    }
}

// TODO: Hypergeometric distribution