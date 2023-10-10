import { Coin, Const, D, Geometric, Max, Sum } from "./dice";

const G = new Geometric(1/2);

for (var k of G.sample_space()) {
    console.log(k, G.pdf(k), G.cdf(k));
}