import { DefaultMap, SampleSpace } from "./sample_space";

export abstract class Roll {
    abstract toString(): string;
    abstract roll(): number;

    // Set up lazy pdf evaluation since it's *usually* finite
    protected abstract density(): DefaultMap;
    _sample_space: SampleSpace | undefined;
    sample_space(): SampleSpace {
        if (this._sample_space !== undefined) {
            return this._sample_space;
        }
        this._sample_space = new SampleSpace(this.density());
        return this._sample_space;
    }

    pdf(n: number): number { return this.sample_space().pdf(n); }
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
}