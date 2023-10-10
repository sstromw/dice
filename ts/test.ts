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

function log_deciles(roll: Roll, buckets = [0.1, 0.2, 0.3,
                                            0.4, 0.5, 0.6,
                                            0.7, 0.8, 0.9]) {
    let i = 0;
    console.log(roll.toString());
    for(let [x,_] of roll.sample_space()) {
        if (roll.cdf(x) > buckets[i]) {
            console.log(`${Math.round(100*buckets[i])}%\t${x}`)
            if (i++ > buckets.length) break;
        }
    }
}

const D25 = new D(25);
const S = new Sum([D25, D25]);
const T = new Max([S, S]);

log_deciles(T);