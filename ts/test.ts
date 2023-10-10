import { Coin, Const, D, Geometric, Max, Sum } from "./dice";

const D4 = new D(4);
const S = new Sum([D4, D4]);

for (var [k,p] of S.sample_space()) {
    console.log(k, p, S.cdf(k));
}