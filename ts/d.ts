import { Roll } from './roll';

export class D extends Roll {
    constructor(readonly n: number) {
        super();
        this.n = n;
    }

    roll() {
        return Math.floor(Math.random() * this.n) + 1;
    }
}