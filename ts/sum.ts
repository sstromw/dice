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
        var A = new Map<number, number>([[0, 1]]);
        var k = this.children.length;
        for(var i = 0; i < k; i++) {
            var b = new Map<number, number>();
            for (var [u,p] of A) {
                for (var [v,q] of this.children[i].sample_space()) {
                    b.set(u+v, p*q + (b.get(u+v) || 0));
                }
            }
            A = b;
        }
        this._sample_space = new SampleSpace(A);
        return this._sample_space;
    }
}