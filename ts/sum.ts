import { Roll } from "./roll";

export class Sum extends Roll {
    constructor(readonly children: Array<Roll>) {
        super();
        this.children = children;
    }

    roll(): number {
        let s = 0;
        this.children.forEach(r => { s += r.roll() });
        return s;
    }
}