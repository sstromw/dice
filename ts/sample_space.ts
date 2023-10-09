type Fn = Map<number, number> | ((val: number) => number) | undefined;

export class SampleSpace {
    _pdf: Fn;
    _cdf: Fn;
    prefer_cdf: boolean;

    constructor(pdf: Fn = undefined, cdf: Fn = undefined, prefer_cdf = false) {
        this._pdf = pdf;
        this._cdf = cdf;
        this.prefer_cdf = prefer_cdf;
        if (this._cdf == undefined) {
            console.log('a');
            this.build_cdf();
            this.prefer_cdf = false;
        }
        if (this._pdf == undefined) {
            console.log('b');
            this.build_pdf();
            this.prefer_cdf = true;
        }
        console.log(this.prefer_cdf);
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
            // TODO
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
        // TODO: this is broken. The default value shouldn't be zero. If n
        // isn't in the map we need to iterate through the keys to find the
        // next smallest value which is in the map.
        return this._cdf?.get(n) || 0;
    }
}