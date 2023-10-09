import { Roll } from "./roll";

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

    pdf(x): never {
        throw new Error("not implemented")
    }

    cdf(x): never {
        throw new Error("not implemented")
    }
}