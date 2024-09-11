
export class BinomialCoefficient {
    static #instance: BinomialCoefficient;

    private _CACHE: Map<number, Array<number>>

    private constructor() {
        this._CACHE = new Map<number, Array<number>>()
    }

    private set_row(n: number) {
        let A: Array<number> = Array.from({ length: 1 + Math.floor(n/2) });
        A[0] = 1;
        let num = 1;
        let den = 1;
        for (let i = 0; 2*i < n; i += 1) {
            num *= n-i
            den *= i+1
            A[i+1] = num / den;
        }
        this._CACHE.set(n, A);
    }

    public static get instance(): BinomialCoefficient {
        if (!BinomialCoefficient.#instance) {
            BinomialCoefficient.#instance = new BinomialCoefficient();
        }
        return BinomialCoefficient.#instance;
    }

    public get(n: number, k: number): number {
        if (k < 0 || k > n) {
            return 0;
        }
        if (2*k > n) {
            k = n-k;
        }
        if (!this._CACHE.has(n)) {
            this.set_row(n);
        }
        return this._CACHE.get(n)[k];
    }
}