import { D, Sum, Max } from "./dice";

const D6 = new D(6);
const TwoD6 = new Sum([D6, D6]);
const MaxD6 = new Max([D6, D6, D6]);

for (var k of MaxD6.sample_space()) {
    console.log(k);
}