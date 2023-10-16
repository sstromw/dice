import { Abs, Coin, Cond, Const, D, Eq, Div, Le, Lt, Ge, Geometric, Gt, Max, Min, Mod, Mult, Ne, Neg, Or, Prod, Roll, Sum } from "./dice";

// The ugliest parser I ever did write
export function Parse(s: string, tokens: Map<string, Roll> | null = null): Roll | undefined {
    s = s.replaceAll(/\s/g, '');
    s = s.toLowerCase();

    let m: RegExpMatchArray | null
    if (!tokens) {
        tokens = new Map<string, Roll>();
    }
    // Match parenthetical
    m = s.match(/(?<prefix>[A-Za-z0-9]*)\((?<infix>[^()]*)\)/);
    if (m) {
        let R: Roll | undefined;
        let params = m.groups?.infix.split(",");
        if (params && params.length > 1) {
            let rolls = params.map((t) => Parse(t, tokens));
            switch(m.groups?.prefix) {
                case "max":
                    R = new Max(rolls as Roll[]);
                    break;
                case "min":
                    R = new Min(rolls as Roll[]);
                    break;
                default:
                    // TODO
                    return undefined;
            }
        }
        else {
            R = Parse(m.groups?.infix || "", tokens);
        }
        if (R) {
            if (m.groups?.prefix.match(/[0-9]+/)) {
                let n = +m.groups?.prefix;
                R = new Mult(n, R);
            }
            let x = `x_${tokens.keys.length}`
            tokens.set(x, R as Roll);
            s = s.replaceAll(m[0], x);
        }
        else {
            return undefined;
        }
    }

    // Match Sum
    let summands = s.split('+');
    if (summands.length > 1) {
        let rolls = summands.map((r) => Parse(r, tokens));
        if (rolls.every((r) => r !== undefined)) {
            return new Sum(rolls as Roll[]);
        }
        return undefined;
    }

    // Match D
    m = s.match(/^(?<n_rolls>[0-9]*)d(?<roll_size>[0-9]+)$/);
    if (m) {
        let die = new D(+(m.groups?.roll_size || 0));
        if (m.groups?.n_rolls) {
            return new Mult(+(m.groups?.n_rolls || 1), die);
        }
        return die;
    }

    // Match token
    m = s.match(/^x_[0-9]*$/);
    if (m) {
        return tokens.get(s);
    }
    throw new Error("parse failed");
}