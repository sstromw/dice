import { SampleSpace } from "./sample_space";

export abstract class Roll {
    abstract roll(): number;
    abstract toString(): string;

    _sample_space: SampleSpace | undefined;
    abstract sample_space(): SampleSpace;
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