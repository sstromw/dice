import { Coin, Const, D, Geometric, Max, Roll, Sum } from "./dice";

function log_roll(roll: Roll) {
    console.log(roll.toString());
    console.log(`mean: ${roll.mean()}`);
    console.log(`var : ${roll.variance()}`);
    console.log(`-----------`);
    for (let [x,p] of roll.sample_space()) {
        console.log(`${x}\t${p}`);
    }
}

const D4 = new D(4);
const S = new Sum([D4, D4]);
const T = new Max([S, S]);

log_roll(T);