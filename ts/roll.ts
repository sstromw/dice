type Pdf = { [val: number]: number; } | ((val: number) => number);
type Cdf = { [val: number]: number; } | ((val: number) => number);

export abstract class Roll {
    abstract roll(): number;
    abstract pdf(x: number): number;
    abstract cdf(x: number): number;
}