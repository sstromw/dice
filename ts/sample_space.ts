
export class DefaultMap {
    map: Map<number, number>;
    min_value: number;
    max_value: number;

    constructor(entries: [number,number][] | undefined = undefined) {
        this.map = new Map(entries);
        this.min_value = Number.MAX_SAFE_INTEGER;
        this.max_value = Number.MIN_SAFE_INTEGER;
    }

    get(k: number): number { return this.map.get(k) || 0; }
    set(k: number, v: number) {
        if (k < this.min_value) this.min_value = k;
        if (k > this.max_value) this.max_value = k;
        this.map.set(k,v);
    }
    increment(k: number, v: number) {
        this.map.set(k, v + this.get(k));
    }

    keys() { return this.map.keys(); }
    values() { return this.map.values(); }
    entries() { return this.map.entries(); }
}

type Fn = DefaultMap | ((val: number) => number) | undefined;

const EPSILON: number = 0.000001;
export class SampleSpace implements Iterable<[number, number]> {
    _pdf: Fn;
    _cdf: Fn;
    prefer_cdf: boolean;
    min_value: number;

    constructor(pdf: Fn = undefined,
                cdf: Fn = undefined,
                prefer_cdf = false,
                min_value: number = 0) {
        this._pdf = pdf;
        this._cdf = cdf;
        this.prefer_cdf = prefer_cdf;
        this.min_value = min_value;
        if (this._cdf == undefined) {
            this.build_cdf();
            this.prefer_cdf = false;
        }
        if (this._pdf == undefined) {
            this.build_pdf();
            this.prefer_cdf = true;
        }
    }
    
    // TODO learn how this actually works so that it's not ugly
    [Symbol.iterator]() {
        let i = this.min_value;
        // This loop covers cases where min_value hasn't been set
        while (this.cdf(i) == 0) {
            i++;
        }
        return {
            next: () => {
                return {
                    done: this.cdf(i-1) > 1-EPSILON,
                    value: [i++, this.pdf(i-1)] as [number, number]
                }
            }
        }
    }

    build_cdf(): void {
        if (this._pdf == undefined) {
            throw new Error("constructing empty sample space");
        } else if (typeof this._pdf === "function") {
            this._cdf = (n: number) => {
                return Array.from(Array(n+1).keys())
                            .reduce((a,b) => a+this.pdf(b), 0);
            }
        } else {
            this._cdf = new DefaultMap();
            let keys: number[] = Array.from(this._pdf.keys())
                                      .sort((a,b)=>a-b);
            this.min_value = keys[0];
            let s = 0;
            for(let i=0; i<keys.length; i++) {
                s += this.pdf(keys[i]);
                this._cdf.set(keys[i], s);
            }
        }
    }
    
    build_pdf(): void {
        if (this._cdf == null) {
            throw new Error("constructing empty sample space");
        }
        else if (typeof this._cdf === "function") {
            this._pdf = (n) => this.cdf(n) - this.cdf(n-1);
            return;
        } else {
            this._pdf = new DefaultMap();
            // TODO but kinda doubt this will ever be necessary.
            throw new Error("not implemented");
        }
    }

    pdf(n: number) {
        if (typeof this._pdf === "function") {
            return this._pdf(n);
        }
        return this._pdf?.get(n) || 0;
    }

    cdf(n: number) {
        if (typeof this._cdf === "function") {
            return this._cdf(n);
        }
        if (n < (this._cdf?.min_value || Number.MIN_SAFE_INTEGER)) return 0;
        if (n > (this._cdf?.max_value || Number.MAX_SAFE_INTEGER)) return 1;
        return this._cdf?.get(n) || 0;
    }
}