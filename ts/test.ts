import { Coin, Const, D, Geometric, Max, Sum } from "./dice";

const D4 = new D(4);
const S = new Sum([D4, D4]);
const T = new Max([S, S]);

for (let [k,p] of T.sample_space()) {
    console.log(k, p, T.cdf(k));
}