import { Abs, Coin, Cond, Const, D, Eq, Div, Le, Lt, Ge, Geometric, Gt, Max, Min, Mod, Mult, Ne, Neg, Or, Prod, Roll, Sum } from "./dice";

// The ugliest parser I ever did write
export class Parse {
    original_input: string
    tokenized_input: string
    tokens: Map<string, Roll>
    constructor(readonly s: string) {
        this.original_input = s;
        this.tokenized_input = 
            this.original_input.toLowerCase().replaceAll(/\s/g, '');
        this.tokens = new Map<string, Roll>();
    }

    private addToken(s: string, r: Roll) {
        let key = `x_${this.tokens.keys.length}`;
        this.tokens.set(key, r);
        this.tokenized_input = this.tokenized_input.replaceAll(s, key);
        // console.log(`${s} => ${key} -- ${this.tokenized_input}`);
    }

    private tokenizeParentheticals(s: string): void {
        let R: Roll | Error;
        let regex = /(?<prefix>[A-Za-z0-9]*)\((?<infix>[^()]*)\)/
        let m = s.match(regex);
        if (m) {
            let params = m?.groups?.infix.split(",");
            if (m && params && params.length > 1) {
                let rolls = params.map((t) => this._parse(t));
                // Need an error check for parameters
                switch(m.groups?.prefix) {
                    case "max":
                        R = new Max(rolls as Roll[]);
                        break;
                    case "min":
                        R = new Min(rolls as Roll[]);
                        break;
                    default:
                        // TODO more
                        R = Error(`unknown symbol: ${m?.groups?.prefix}`)
                }
            } else {
                // TODO fix this
                R = this._parse(m.groups?.infix || "");
            }
            if (m && (R as Roll)) {
                if (m.groups?.prefix.match(/[0-9]+/)) {
                    let n = +m?.groups?.prefix;
                    R = new Mult(n, R as Roll);
                }
                this.addToken(m[0], R as Roll);
            }
        }
    }

    private _parse(s: string): Roll | Error {
        if (s.match(/[()]/)) {
            console.log(`Warning: no parentheticals in _parse: ${s}`)
        }

        // Match Sum
        let summands = s.split('+');
        if (summands.length > 1) {
            let rolls = summands.map((t) => this._parse(t));
            // TODO Needs error checking
            return new Sum(rolls as Roll[]);
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

        // Match token
        m = s.match(/^x_[0-9]*$/);
        if (m) {
            return this.tokens.get(s) || Error(`unknown symbol: ${s}`);
        }
        return new Error(`unknown symbol: ${s}`);
    }

    parse(): Roll | Error {
        while (this.tokenized_input.match(/[()]/)) {
            this.tokenizeParentheticals(this.tokenized_input);
        }
        return this._parse(this.tokenized_input);
    }
}