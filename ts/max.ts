import { Roll } from "./roll";

export class Max extends Roll {
    constructor(readonly children: Array<Roll>) {
        super();
        this.children = children;
    }

    roll(): number {
        let s = Number.MIN_SAFE_INTEGER;
        this.children.forEach(r => { s = Math.max(r.roll(), s); });
        return s;
    }
}