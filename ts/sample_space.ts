type Fn = Map<number, number> | ((val: number) => number) | undefined;

const EPSILON: number = 0.000001;

export class SampleSpace implements Iterable<number> {
    _pdf: Fn;
    _cdf: Fn;
    prefer_cdf: boolean;
    min_value: number;

    constructor(
        pdf: Fn = undefined,
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
    
    [Symbol.iterator]() {
        var counter = this.min_value;
        // This loop covers cases where min_value hasn't been set
        while (this.cdf(counter) == 0) {
            counter++;
        }
        return {
            next: () => {
                return {
                    done: this.cdf(counter-1) > 1-EPSILON,
                    value: counter++
                }
            }
        }
    }

    build_cdf(): void {
        if (this._pdf == undefined) {
            throw new Error("constructing empty sample space");
        } else if (typeof this._pdf === "function") {
            this._cdf = (n: number) => {
                return Array.from(Array(n+1).keys()).reduce((a,b) => a+this.pdf(b));
            }
        } else {
            this._cdf = new Map<number, number>();
            var keys = Array.from(this._pdf.keys()).sort();
            this.min_value = keys[0];
            var s = 0;
            for(var i=0; i<keys.length; i++) {
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
            this._pdf = new Map<number, number>();
            // TODO kinda doubt this will ever be necessary.
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
        var x = this._cdf?.get(n);
        if (x) {
            return x;
        }
        while (n > this.min_value && this._cdf?.get(n) === undefined) {
            n--;
        }
        return this._cdf?.get(n) || 0;
    }
}