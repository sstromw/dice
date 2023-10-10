import { D, Sum, Max } from "./dice";

const D6 = new D(6);
const TwoD6 = new Sum([D6, D6]);
const MaxD6 = new Max([D6, D6, D6]);

for (let i = -1; i < 9; i++) {
    console.log(i, MaxD6.pdf(i), MaxD6.cdf(i));
}