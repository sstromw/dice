import { Const, D, Max, Sum } from "./dice";

const D6 = new D(6);
const TwoD6 = new Sum([D6, D6]);
const R = new Max([TwoD6, new Const(6)]);

for (var k of R.sample_space()) {
    console.log(k, R.pdf(k), R.cdf(k));
}