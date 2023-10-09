import { Roll } from "./roll";
import { SampleSpace } from "./sample_space";

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

    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        // TODO
        throw new Error("not implemented");
    }
}