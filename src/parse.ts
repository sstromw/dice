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
        let key = `x_${this.tokens.size}`;
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
                    case "sum":
                        R = new Sum(rolls as Roll[]);
                        break;
                    case "prod":
                        R = new Prod(rolls as Roll[]);
                        break;
                    case "max":
                        R = new Max(rolls as Roll[]);
                        break;
                    case "max":
                        R = new Max(rolls as Roll[]);
                        break;
                    case "min":
                        R = new Min(rolls as Roll[]);
                        break;
                    case "or":
                        R = new Or(rolls as Roll[]);
                        break;
                    // case "cond":
                    //     // TODO fix error checking
                    //     if (rolls.length != 3) {
                    //         R = new Error("called cond without three parameters");
                    //     } else {
                    //         R = new Cond(rolls[0] as Roll, rolls[1] as Roll, rolls[2] as Roll);
                    //     }
                    default:
                        R = Error(`unknown symbol: ${m?.groups?.prefix}`)
                }
            } else {
                // TODO fix this
                R = this._parse(m.groups?.infix || "");
            }
            if (m && (R as Roll)) {
                if (m.groups?.prefix.match(/[0-9]+/)) {
                    let n = +m.groups?.prefix;
                    R = new Mult(n, R as Roll);
                }
                if (m.groups?.prefix == "g") {
                    // TODO you should be able to write G(1/100)
                    let x = +m.groups?.infix;
                    R = new Geometric(x);
                }
                if (m.groups?.prefix == "c") {
                    let x = +m.groups?.infix || 0.5;
                    R = new Coin(x);
                }
                this.addToken(m[0], R as Roll);
            }
        }
    }

    private parseOp(s: string, operator: string, fn: (val: Roll[]) => Roll): Roll | undefined {
        let operands = s.split(operator)
        if (operands.length > 1) {
            let rolls = operands.map((t) => this._parse(t));
            // TODO add error checking
            return fn(rolls as Roll[]);
        }
        return undefined;
    }

    private parseBinaryOp(s: string, op: string, fn: (l: Roll, r: Roll) => Roll): Roll | undefined {
        let re = new RegExp(`^(?<left>.*)${op}(?<right>.*)$`)
        let m = s.match(re);
        if (m) {
            // TODO add error checking
            let L = this._parse(m.groups?.left || "");
            let R = this._parse(m.groups?.right || "");
            return fn(L as Roll, R as Roll);
        }
        return undefined;
    }

    private _parse(s: string): Roll | Error {
        if (s.match(/[()]/)) {
            console.log(`Warning: no parentheticals in _parse: ${s}`)
        }
        
        // **** Lower precedence should be at the top **** //
        // ****         Sum comes before Prod         **** //

        // Problems
        // * Abs, Cond, Div, and Mod aren't covered
        // * Subtraction is totally broken
        // * Cond is actually broken since it still requires a Coin condition
        // * Abs is broken because it gets interpreted as Or

        // Match reducers
        let R: Roll;
        if (R = this.parseOp(s, "+", (rs) => new Sum(rs)) as Roll) {
            return R;
        }
        if (R = this.parseOp(s, "*", (rs) => new Prod(rs)) as Roll) {
            return R;
        }
        if (R = this.parseOp(s, "<<", (rs) => new Min(rs)) as Roll) {
            return R;
        }
        if (R = this.parseOp(s, ">>", (rs) => new Max(rs)) as Roll) {
            return R;
        }
        if (R = this.parseOp(s, "|", (rs) => new Or(rs)) as Roll) {
            return R;
        }

        // Match binary operators
        if (R = this.parseBinaryOp(s, "=", (l,r) => new Eq(l,r)) as Roll) {
            return R;
        }
        if (R = this.parseBinaryOp(s, "!=", (l,r) => new Ne(l,r)) as Roll) {
            return R;
        }
        if (R = this.parseBinaryOp(s, "<", (l,r) => new Lt(l,r)) as Roll) {
            return R;
        }
        if (R = this.parseBinaryOp(s, "<=", (l,r) => new Le(l,r)) as Roll) {
            return R;
        }
        if (R = this.parseBinaryOp(s, ">", (l,r) => new Gt(l,r)) as Roll) {
            return R;
        }
        if (R = this.parseBinaryOp(s, ">=", (l,r) => new Ge(l,r)) as Roll) {
            return R;
        }

        let m: RegExpMatchArray | null;

        // Match Neg
        if (m = s.match(/^-(?<infix>.*$)/)) {
            // TODO add error checking
            let R = this._parse(m.groups?.infix || "");
            return new Neg(R as Roll);
        }

        // Match D
        m = s.match(/^(?<n_rolls>[0-9]*)d(?<roll_size>[0-9]+)$/);
        if (m && m.groups?.roll_size) {
            let n = +m.groups?.roll_size;
            let die = new D(n);
            if (m.groups?.n_rolls) {
                return new Mult(+(m.groups?.n_rolls || 1), die);
            }
            return die;
        }

        // Match Const
        if (m = s.match(/^([0-9]*)$/)) {
            return new Const(+s);
        }

        // Match Coin
        if (m = s.match(/^c$/)) {
            return new Coin();
        }

        // Match token
        if (m = s.match(/^x_[0-9]*$/)) {
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