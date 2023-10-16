import { Abs, Coin, Cond, Const, D, Eq, Div, Le, Lt, Ge, Geometric, Gt, Max, Min, Mod, Mult, Ne, Neg, Or, Prod, Roll, Sum } from "./dice";


export function Parse(s: string): Roll | undefined {
    // Trim whitespace
    s = s.replaceAll(/\s/g, '');

    // Match Sum
    let summands = s.split('+');
    if (summands.length > 1) {
        let rolls = summands.map((r) => Parse(r));
        if (rolls.every((r) => r !== undefined)) {
            return new Sum(rolls as Roll[]);
        }
        return undefined;
    }

    // Match D
    let m = s.match(/^(?<n_rolls>[0-9]*)d(?<roll_size>[0-9]+)$/);
    if (m) {
        let die = new D(+(m.groups?.roll_size || 0));
        if (m.groups?.n_rolls) {
            return new Mult(+(m.groups?.n_rolls || 1), die);
        }
        return die;
    }
    throw new Error("parse failed");
}