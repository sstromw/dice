import { Roll } from './roll';

export class D extends Roll {
    constructor(readonly n: number) {
        super();
        this.n = n;
    }

    roll() {
        return Math.floor(Math.random() * this.n) + 1;
    }

    pdf(x: number) {
        if (x < 1 || x > this.n) return 0;
        return 1. / this.n;
    }

    cdf(x: number) {
        if (x < 1 || x > this.n) return 0;
        return x / this.n;
    }
}