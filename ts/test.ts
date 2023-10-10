import { Coin, Const, D, Max, Sum } from "./dice";

const C = new Coin();
// Binomial
const R = new Sum([C, C, C, C, C, C]);

for (var k of R.sample_space()) {
    console.log(k, R.pdf(k), R.cdf(k));
}