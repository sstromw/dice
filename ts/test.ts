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
            console.log(`${Math.round(100*buckets[i])}%\t${x}`);
            if (++i == buckets.length) return;
        }
    }
}

function verify(roll: Roll, N=100000, verbose=false): boolean {
    let counts: Map<number, number> = new Map();
    for (let i = 0; i<N; i++) {
        let x = roll.roll();
        counts.set(x, 1 + (counts.get(x) || 0));
    }
    let diffs = Array.from(counts).map(([k,v]) => Math.abs(v/N - roll.pdf(k)));
    let max = diffs.reduce((a,b) => Math.max(a,b), diffs[0]);
    if (verbose && max > 0.005) {
        console.log(`Discrepancy on ${roll.toString()}: ${max}`);
    }
    return max < 0.005;
}

const D6 = new D(6);
const S  = new Sum([D6,D6,D6]);
const M  = new Max([D6,D6,D6]);
const G2 = new Geometric(1/2);
const TESTS = [D6, S, M, G2];

if (true) {
    for (let r of TESTS) {
        console.log(`${r.toString()}\t:\t${verify(r) ? 'PASS' : 'FAIL'}`);
    }
}