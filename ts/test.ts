import { Abs, Coin, Cond, Const, D, Div, Geometric, Mod, Or, Max, Roll, Sum, Prod, Min } from "./dice";

function log_roll(roll: Roll) {
    console.log(roll.toString());
    console.log(`mean: ${roll.mean()}`);
    console.log(`var : ${roll.variance()}`);
    console.log(`--------------`);
    for (let [x,p] of roll.sample_space()) {
        if (p > 0.00005) {
            console.log(`${x}\t${p.toFixed(4)}`);
        }
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

function verify(roll: Roll, verbose=false, N=100000): boolean {
    let counts: Map<number, number> = new Map();
    for (let i = 0; i<N; i++) {
        let x = roll.roll();
        counts.set(x, 1 + (counts.get(x) || 0));
    }
    if (verbose) {
        for (let [k,v] of counts) {
            console.log(`${k}\t:\t${v/N}\t${roll.pdf(k)}`);
        }
    }
    let diffs = Array.from(counts).map(([k,v]) => Math.abs(v/N - roll.pdf(k)));
    let max = diffs.reduce((a,b) => Math.max(a,b), diffs[0]);
    if (verbose && max > 0.005) {
        console.log(`Discrepancy on ${roll.toString()}: ${max}`);
    }
    return max < 0.005;
}

const D6   = new D(6);
const TWO  = new Const(2);
const COIN = new Coin();
const TESTS = [
    D6,
    TWO,
    new Sum([D6,D6,D6]),
    new Prod([D6,TWO]),
    new Min([D6,D6,D6]),
    new Max([D6,D6,D6]),
    new Sum([COIN, COIN, COIN, COIN, COIN]),
    new Cond(COIN, D6, TWO),
    new Or([D6, TWO, COIN]),
    new Geometric(1/2),
]

if (true) {
    for (let r of TESTS) {
        console.log(`${r.toString()}\t:\t${verify(r) ? 'PASS' : 'FAIL'}`);
    }
}

