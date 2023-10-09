import { Roll } from "./roll";

export class Sum extends Roll {
    constructor(readonly children: Array<Roll>) {
        super();
        this.children = children;
    }

    roll() {
        let s = 0;
        this.children.forEach(r => { s += r.roll() });
        return s;
    }

    pdf(x): never {
        throw new Error("not implemented")
    }

    cdf(x): never {
        throw new Error("not implemented")
    }
}