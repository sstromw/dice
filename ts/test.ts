import { Roll } from "./roll";
import { D } from "./d";
import { Sum } from "./sum";
import { Max } from "./max";

const D6 = new D(6);
const TwoD6 = new Sum([D6, D6]);
const MaxD6 = new Max([D6, D6, D6]);

var counts: { [val: number] : number; } = {};
for (let i = 0; i < 36000; i++) {
    var x = MaxD6.roll();
    counts[x] = 1 + (counts[x] || 0);
}

for (var key in counts) {
    console.log(key, counts[key]);
}