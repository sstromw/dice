System.register("sample_space", [], function (exports_1, context_1) {
    "use strict";
    var DefaultMap, EPSILON, SampleSpace;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            DefaultMap = class DefaultMap {
                constructor(entries = undefined) {
                    this.map = new Map(entries);
                    this.min_value = Number.MAX_SAFE_INTEGER;
                    this.max_value = Number.MIN_SAFE_INTEGER;
                }
                get(k) { return this.map.get(k) || 0; }
                set(k, v) {
                    if (k < this.min_value)
                        this.min_value = k;
                    if (k > this.max_value)
                        this.max_value = k;
                    this.map.set(k, v);
                }
                increment(k, v) {
                    this.map.set(k, v + this.get(k));
                }
                keys() { return this.map.keys(); }
                values() { return this.map.values(); }
                entries() { return this.map.entries(); }
            };
            exports_1("DefaultMap", DefaultMap);
            EPSILON = 0.000001;
            SampleSpace = class SampleSpace {
                constructor(pdf = undefined, cdf = undefined, prefer_cdf = false, min_value = 0) {
                    this._pdf = pdf;
                    this._cdf = cdf;
                    this.prefer_cdf = prefer_cdf;
                    this.min_value = min_value;
                    if (this._cdf == undefined) {
                        this.build_cdf();
                        this.prefer_cdf = false;
                    }
                    if (this._pdf == undefined) {
                        this.build_pdf();
                        this.prefer_cdf = true;
                    }
                }
                [Symbol.iterator]() {
                    let i = this.min_value;
                    while (this.cdf(i) == 0) {
                        i++;
                    }
                    return {
                        next: () => {
                            return {
                                done: this.cdf(i - 1) > 1 - EPSILON,
                                value: [i++, this.pdf(i - 1)]
                            };
                        }
                    };
                }
                build_cdf() {
                    if (this._pdf == undefined) {
                        throw new Error("constructing empty sample space");
                    }
                    else if (typeof this._pdf === "function") {
                        this._cdf = (n) => {
                            return Array.from(Array(n + 1).keys())
                                .reduce((a, b) => a + this.pdf(b), 0);
                        };
                    }
                    else {
                        this._cdf = new DefaultMap();
                        let keys = Array.from(this._pdf.keys())
                            .sort((a, b) => a - b);
                        this.min_value = keys[0];
                        let s = 0;
                        for (let i = 0; i < keys.length; i++) {
                            s += this.pdf(keys[i]);
                            this._cdf.set(keys[i], s);
                        }
                    }
                }
                build_pdf() {
                    if (this._cdf == null) {
                        throw new Error("constructing empty sample space");
                    }
                    else if (typeof this._cdf === "function") {
                        this._pdf = (n) => this.cdf(n) - this.cdf(n - 1);
                        return;
                    }
                    else {
                        this._pdf = new DefaultMap();
                        throw new Error("not implemented");
                    }
                }
                pdf(n) {
                    var _a;
                    if (typeof this._pdf === "function") {
                        return this._pdf(n);
                    }
                    return ((_a = this._pdf) === null || _a === void 0 ? void 0 : _a.get(n)) || 0;
                }
                cdf(n) {
                    var _a, _b, _c;
                    if (typeof this._cdf === "function") {
                        return this._cdf(n);
                    }
                    if (n < (((_a = this._cdf) === null || _a === void 0 ? void 0 : _a.min_value) || Number.MIN_SAFE_INTEGER))
                        return 0;
                    if (n > (((_b = this._cdf) === null || _b === void 0 ? void 0 : _b.max_value) || Number.MAX_SAFE_INTEGER))
                        return 1;
                    return ((_c = this._cdf) === null || _c === void 0 ? void 0 : _c.get(n)) || 0;
                }
            };
            exports_1("SampleSpace", SampleSpace);
        }
    };
});
System.register("roll", ["sample_space"], function (exports_2, context_2) {
    "use strict";
    var sample_space_1, Roll;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (sample_space_1_1) {
                sample_space_1 = sample_space_1_1;
            }
        ],
        execute: function () {
            Roll = class Roll {
                sample_space() {
                    if (this._sample_space !== undefined) {
                        return this._sample_space;
                    }
                    this._sample_space = new sample_space_1.SampleSpace(this.density());
                    return this._sample_space;
                }
                pdf(n) { return this.sample_space().pdf(n); }
                cdf(n) { return this.sample_space().cdf(n); }
                mean() {
                    let s = 0;
                    for (let [k, p] of this.sample_space()) {
                        s += p * k;
                    }
                    return s;
                }
                variance() {
                    let mu = this.mean();
                    let s = 0;
                    for (let [k, p] of this.sample_space()) {
                        s += p * Math.pow((k - mu), 2);
                    }
                    return s;
                }
            };
            exports_2("Roll", Roll);
        }
    };
});
System.register("compare", ["roll", "sample_space"], function (exports_3, context_3) {
    "use strict";
    var roll_1, sample_space_2, CompareOp, Eq, Ne, Gt, Le, Lt, Ge;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (roll_1_1) {
                roll_1 = roll_1_1;
            },
            function (sample_space_2_1) {
                sample_space_2 = sample_space_2_1;
            }
        ],
        execute: function () {
            CompareOp = class CompareOp extends roll_1.Roll {
                constructor(op, left, right, symbol) {
                    super();
                    this.op = op;
                    this.left = left;
                    this.right = right;
                    this.symbol = symbol;
                    this.op = op;
                    this.left = left;
                    this.right = right;
                    this.symbol = symbol;
                }
                toString() { return `${this.left} ${this.symbol} ${this.right}`; }
                roll() { return this.op(this.left.roll(), this.right.roll()) ? 1 : 0; }
            };
            Eq = class Eq extends CompareOp {
                constructor(left, right) {
                    super((x, y) => x == y, left, right, "=");
                    this.left = left;
                    this.right = right;
                }
                density() {
                    let A = new sample_space_2.DefaultMap();
                    for (let [k, v] of this.left.sample_space()) {
                        A.increment(1, v * this.right.pdf(k));
                    }
                    A.set(0, 1 - A.get(1));
                    return A;
                }
            };
            exports_3("Eq", Eq);
            Ne = class Ne extends CompareOp {
                constructor(left, right) {
                    super((x, y) => x != y, left, right, "!=");
                    this.left = left;
                    this.right = right;
                }
                density() {
                    let A = new sample_space_2.DefaultMap();
                    for (let [k, v] of this.left.sample_space()) {
                        A.increment(0, v * this.right.pdf(k));
                    }
                    A.set(1, 1 - A.get(0));
                    return A;
                }
            };
            exports_3("Ne", Ne);
            Gt = class Gt extends CompareOp {
                constructor(left, right) {
                    super((x, y) => x > y, left, right, ">");
                    this.left = left;
                    this.right = right;
                }
                density() {
                    let A = new sample_space_2.DefaultMap();
                    for (let [k, v] of this.left.sample_space()) {
                        A.increment(1, v * this.right.cdf(k - 1));
                    }
                    A.set(0, 1 - A.get(1));
                    return A;
                }
            };
            exports_3("Gt", Gt);
            Le = class Le extends CompareOp {
                constructor(left, right) {
                    super((x, y) => x <= y, left, right, "<=");
                    this.left = left;
                    this.right = right;
                }
                density() {
                    let A = new sample_space_2.DefaultMap();
                    for (let [k, v] of this.left.sample_space()) {
                        A.increment(0, v * this.right.cdf(k - 1));
                    }
                    A.set(1, 1 - A.get(0));
                    return A;
                }
            };
            exports_3("Le", Le);
            Lt = class Lt extends CompareOp {
                constructor(left, right) {
                    super((x, y) => x < y, left, right, "<");
                    this.left = left;
                    this.right = right;
                }
                density() {
                    let A = new sample_space_2.DefaultMap();
                    for (let [k, v] of this.left.sample_space()) {
                        A.increment(1, v * (1 - this.right.cdf(k)));
                    }
                    A.set(0, 1 - A.get(1));
                    return A;
                }
            };
            exports_3("Lt", Lt);
            Ge = class Ge extends CompareOp {
                constructor(left, right) {
                    super((x, y) => x >= y, left, right, ">=");
                    this.left = left;
                    this.right = right;
                }
                density() {
                    let A = new sample_space_2.DefaultMap();
                    for (let [k, v] of this.left.sample_space()) {
                        A.increment(0, v * (1 - this.right.cdf(k)));
                    }
                    A.set(1, 1 - A.get(0));
                    return A;
                }
            };
            exports_3("Ge", Ge);
        }
    };
});
System.register("cond", ["roll", "sample_space"], function (exports_4, context_4) {
    "use strict";
    var roll_2, sample_space_3, Coin, Cond, Or;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (roll_2_1) {
                roll_2 = roll_2_1;
            },
            function (sample_space_3_1) {
                sample_space_3 = sample_space_3_1;
            }
        ],
        execute: function () {
            Coin = class Coin extends roll_2.Roll {
                constructor(p = 0.5) {
                    super();
                    this.p = p;
                    if (p < 0 || p > 1) {
                        throw new Error("probability out of bounds: " + p);
                    }
                    this.p = p;
                }
                toString() { return `B(${this.p})`; }
                roll() {
                    return Math.random() < this.p ? 1 : 0;
                }
                density() {
                    return new sample_space_3.DefaultMap([[0, 1 - this.p], [1, this.p]]);
                }
                mean() { return this.p; }
                variance() { return this.p * (1 - this.p); }
            };
            exports_4("Coin", Coin);
            Cond = class Cond extends roll_2.Roll {
                constructor(condition, success, failure) {
                    super();
                    this.condition = condition;
                    this.success = success;
                    this.failure = failure;
                    this.condition = condition;
                    this.success = success;
                    this.failure = failure;
                }
                toString() {
                    return `${this.condition} ? ${this.success} : ${this.failure}`;
                }
                roll() {
                    return this.condition.roll() ?
                        this.success.roll() :
                        this.failure.roll();
                }
                mean() {
                    return this.condition.p * this.success.mean() +
                        (1 - this.condition.p) * this.failure.mean();
                }
                density() {
                    let A = new sample_space_3.DefaultMap();
                    let p = this.condition.p;
                    for (let [k, v] of this.success.sample_space()) {
                        A.increment(k, p * v);
                    }
                    for (let [k, v] of this.failure.sample_space()) {
                        A.increment(k, (1 - p) * v);
                    }
                    return A;
                }
            };
            exports_4("Cond", Cond);
            Or = class Or extends roll_2.Roll {
                constructor(rolls) {
                    super();
                    this.rolls = rolls;
                    this.rolls = rolls;
                    this.length = this.rolls.length;
                }
                toString() {
                    return `(${this.rolls.map((R) => R.toString()).join("|")})`;
                }
                roll() {
                    let n = Math.floor(Math.random() * this.length);
                    return this.rolls[n].roll();
                }
                density() {
                    let A = new sample_space_3.DefaultMap();
                    for (let R of this.rolls) {
                        for (let [k, v] of R.sample_space()) {
                            A.increment(k, v / this.length);
                        }
                    }
                    return A;
                }
                mean() {
                    return this.rolls.reduce((a, r) => a + r.roll(), 0) / this.length;
                }
            };
            exports_4("Or", Or);
        }
    };
});
System.register("d", ["roll", "sample_space"], function (exports_5, context_5) {
    "use strict";
    var roll_3, sample_space_4, D, Const;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (roll_3_1) {
                roll_3 = roll_3_1;
            },
            function (sample_space_4_1) {
                sample_space_4 = sample_space_4_1;
            }
        ],
        execute: function () {
            D = class D extends roll_3.Roll {
                constructor(n) {
                    super();
                    this.n = n;
                    this.n = n;
                }
                toString() { return `d${this.n}`; }
                roll() {
                    return 1 + Math.floor(Math.random() * this.n);
                }
                density() {
                    let M = new sample_space_4.DefaultMap();
                    for (let k = 1; k <= this.n; k++) {
                        M.set(k, 1 / this.n);
                    }
                    return M;
                }
                mean() { return (this.n + 1) / 2; }
                variance() { return (Math.pow(this.n, 2) - 1) / 12; }
            };
            exports_5("D", D);
            Const = class Const extends roll_3.Roll {
                constructor(val) {
                    super();
                    this.val = val;
                    this.val = val;
                }
                toString() { return this.val.toString(); }
                roll() { return this.val; }
                density() { return new sample_space_4.DefaultMap([[this.val, 1]]); }
                mean() { return this.val; }
                variance() { return 0; }
            };
            exports_5("Const", Const);
        }
    };
});
System.register("geometric", ["roll", "sample_space"], function (exports_6, context_6) {
    "use strict";
    var roll_4, sample_space_5, Geometric;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (roll_4_1) {
                roll_4 = roll_4_1;
            },
            function (sample_space_5_1) {
                sample_space_5 = sample_space_5_1;
            }
        ],
        execute: function () {
            Geometric = class Geometric extends roll_4.Roll {
                constructor(p) {
                    super();
                    this.p = p;
                    if (p < 0 || p > 1) {
                        throw new Error("probability out of bounds: " + p);
                    }
                    this.p = p;
                }
                roll() {
                    let i;
                    for (i = 1; Math.random() > this.p; i++)
                        ;
                    return i;
                }
                density() { return new sample_space_5.DefaultMap(); }
                sample_space() {
                    if (this._sample_space !== undefined) {
                        return this._sample_space;
                    }
                    this._sample_space = new sample_space_5.SampleSpace((n) => n > 0 ? Math.pow(1 - this.p, n - 1) * this.p : 0);
                    return this._sample_space;
                }
                mean() { return 1 / this.p; }
                variance() { return (1 - this.p) / Math.pow(this.p, 2); }
                toString() { return `G(${this.p})`; }
            };
            exports_6("Geometric", Geometric);
        }
    };
});
System.register("reducers", ["roll", "sample_space"], function (exports_7, context_7) {
    "use strict";
    var roll_5, sample_space_6, AssociativeReduction, _sum, Sum, Mult, _prod, Prod, Min, Max, UnivariateMap, Abs, Neg, Mod, Div;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (roll_5_1) {
                roll_5 = roll_5_1;
            },
            function (sample_space_6_1) {
                sample_space_6 = sample_space_6_1;
            }
        ],
        execute: function () {
            AssociativeReduction = class AssociativeReduction extends roll_5.Roll {
                constructor(rolls, op, symbol) {
                    super();
                    this.rolls = rolls;
                    this.op = op;
                    this.symbol = symbol;
                    this.rolls = rolls;
                    this.op = op;
                    this.symbol = symbol;
                }
                roll() {
                    return this.op(this.rolls.map((r) => r.roll()));
                }
                density() {
                    let A = this.rolls[0].sample_space();
                    for (let i = 1; i < this.rolls.length; i++) {
                        let b = new sample_space_6.DefaultMap();
                        for (let [u, p] of A) {
                            for (let [v, q] of this.rolls[i].sample_space()) {
                                let x = this.op([u, v]);
                                b.increment(x, p * q);
                            }
                        }
                        A = new sample_space_6.SampleSpace(b);
                    }
                    return A._pdf;
                }
                toString() {
                    let strs = this.rolls.map((r) => r.toString()).join(',');
                    return `${this.symbol}(${strs})`;
                }
            };
            _sum = (M) => M.reduce((a, b) => a + b, 0);
            Sum = class Sum extends AssociativeReduction {
                constructor(rolls) {
                    super(rolls, _sum, "Sum");
                    this.rolls = rolls;
                    this.rolls = rolls;
                }
                mean() { return _sum(this.rolls.map((R) => R.mean())); }
                variance() { return _sum(this.rolls.map((R) => R.variance())); }
            };
            exports_7("Sum", Sum);
            Mult = class Mult extends Sum {
                constructor(n, R) {
                    super(Array.from({ length: n }, (_) => R));
                    this.n = n;
                    this.R = R;
                    this.R = R;
                    this.n = n;
                }
                toString() { return `${this.n}${this.R}`; }
            };
            exports_7("Mult", Mult);
            _prod = (M) => M.reduce((a, b) => a * b, 1);
            Prod = class Prod extends AssociativeReduction {
                constructor(rolls) {
                    super(rolls, _prod, "Prod");
                    this.rolls = rolls;
                    this.rolls = rolls;
                }
                mean() { return _prod(this.rolls.map((R) => R.mean())); }
            };
            exports_7("Prod", Prod);
            Min = class Min extends AssociativeReduction {
                constructor(rolls) {
                    super(rolls, (R) => Math.min(...R), "Min");
                    this.rolls = rolls;
                    this.rolls = rolls;
                }
            };
            exports_7("Min", Min);
            Max = class Max extends roll_5.Roll {
                constructor(rolls) {
                    super();
                    this.rolls = rolls;
                    this.rolls = rolls;
                }
                roll() {
                    let s = Number.MIN_SAFE_INTEGER;
                    this.rolls.forEach(r => { s = Math.max(r.roll(), s); });
                    return s;
                }
                density() { return new sample_space_6.DefaultMap(); }
                sample_space() {
                    if (this._sample_space !== undefined) {
                        return this._sample_space;
                    }
                    let cdf = (n) => this.rolls.reduce((p, r) => p * r.cdf(n), 1);
                    this._sample_space = new sample_space_6.SampleSpace(undefined, cdf);
                    return this._sample_space;
                }
                toString() {
                    let strs = this.rolls.map((r) => r.toString()).join(',');
                    return `Max(${strs})`;
                }
            };
            exports_7("Max", Max);
            UnivariateMap = class UnivariateMap extends roll_5.Roll {
                constructor(R, op) {
                    super();
                    this.R = R;
                    this.op = op;
                    this.R = R;
                    this.op = op;
                }
                roll() {
                    return this.op(this.R.roll());
                }
                density() {
                    let A = new sample_space_6.DefaultMap();
                    for (let [k, v] of this.R.sample_space()) {
                        let x = this.op(k);
                        A.increment(x, v);
                    }
                    return A;
                }
            };
            Abs = class Abs extends UnivariateMap {
                constructor(R) {
                    super(R, Math.abs);
                    this.R = R;
                    this.R = R;
                }
                toString() { return `|${this.R}|`; }
            };
            exports_7("Abs", Abs);
            Neg = class Neg extends UnivariateMap {
                constructor(R) {
                    super(R, (x) => -x);
                    this.R = R;
                    this.R = R;
                }
                toString() { return `-${this.R}`; }
            };
            exports_7("Neg", Neg);
            Mod = class Mod extends UnivariateMap {
                constructor(R, n) {
                    super(R, (x) => x % n);
                    this.R = R;
                    this.n = n;
                    this.R = R;
                    this.n = n;
                }
                toString() { return `${this.R}%${this.n}`; }
            };
            exports_7("Mod", Mod);
            Div = class Div extends UnivariateMap {
                constructor(R, n) {
                    super(R, (x) => Math.floor(x / n));
                    this.R = R;
                    this.n = n;
                    this.R = R;
                    this.n = n;
                }
                toString() { return `${this.R}/${this.n}`; }
            };
            exports_7("Div", Div);
        }
    };
});
System.register("dice", ["roll", "compare", "cond", "d", "geometric", "reducers"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (roll_6_1) {
                exports_8({
                    "Roll": roll_6_1["Roll"]
                });
            },
            function (compare_1_1) {
                exports_8({
                    "Eq": compare_1_1["Eq"],
                    "Ne": compare_1_1["Ne"],
                    "Lt": compare_1_1["Lt"],
                    "Le": compare_1_1["Le"],
                    "Gt": compare_1_1["Gt"],
                    "Ge": compare_1_1["Ge"]
                });
            },
            function (cond_1_1) {
                exports_8({
                    "Coin": cond_1_1["Coin"],
                    "Cond": cond_1_1["Cond"],
                    "Or": cond_1_1["Or"]
                });
            },
            function (d_1_1) {
                exports_8({
                    "D": d_1_1["D"],
                    "Const": d_1_1["Const"]
                });
            },
            function (geometric_1_1) {
                exports_8({
                    "Geometric": geometric_1_1["Geometric"]
                });
            },
            function (reducers_1_1) {
                exports_8({
                    "Sum": reducers_1_1["Sum"],
                    "Mult": reducers_1_1["Mult"],
                    "Prod": reducers_1_1["Prod"],
                    "Min": reducers_1_1["Min"],
                    "Max": reducers_1_1["Max"],
                    "Abs": reducers_1_1["Abs"],
                    "Neg": reducers_1_1["Neg"],
                    "Mod": reducers_1_1["Mod"],
                    "Div": reducers_1_1["Div"]
                });
            }
        ],
        execute: function () {
        }
    };
});
System.register("test", ["dice"], function (exports_9, context_9) {
    "use strict";
    var dice_1, D6, TWO, COIN, TESTS;
    var __moduleName = context_9 && context_9.id;
    function log_roll(roll) {
        console.log(roll.toString());
        console.log(`mean: ${roll.mean().toFixed(4)}`);
        console.log(`var : ${roll.variance().toFixed(4)}`);
        console.log(`--------------`);
        for (let [x, p] of roll.sample_space()) {
            if (p > 0.00005) {
                console.log(`${x}\t${p.toFixed(4)}`);
            }
        }
        console.log();
    }
    function log_deciles(roll, buckets = [0.1, 0.2, 0.3,
        0.4, 0.5, 0.6,
        0.7, 0.8, 0.9]) {
        let i = 0;
        console.log(roll.toString());
        for (let [x, _] of roll.sample_space()) {
            if (roll.cdf(x) > buckets[i]) {
                console.log(`${Math.round(100 * buckets[i])}%\t${x}`);
                if (++i == buckets.length)
                    return;
            }
        }
    }
    function verify(roll, verbose = false, N = 100000) {
        let counts = new Map();
        for (let i = 0; i < N; i++) {
            let x = roll.roll();
            counts.set(x, 1 + (counts.get(x) || 0));
        }
        if (verbose) {
            for (let [k, v] of counts) {
                console.log(`${k}\t:\t${v / N}\t${roll.pdf(k)}`);
            }
        }
        let diffs = Array.from(counts).map(([k, v]) => Math.abs(v / N - roll.pdf(k)));
        let max = diffs.reduce((a, b) => Math.max(a, b), diffs[0]);
        if (verbose && max > 0.005) {
            console.log(`Discrepancy on ${roll.toString()}: ${max}`);
        }
        return max < 0.005;
    }
    return {
        setters: [
            function (dice_1_1) {
                dice_1 = dice_1_1;
            }
        ],
        execute: function () {
            D6 = new dice_1.D(6);
            TWO = new dice_1.Const(2);
            COIN = new dice_1.Coin();
            TESTS = [
                D6,
                TWO,
                new dice_1.Sum([D6, D6, TWO]),
                new dice_1.Mult(3, D6),
                new dice_1.Prod([D6, TWO]),
                new dice_1.Min([D6, D6, D6]),
                new dice_1.Max([D6, D6, D6]),
                new dice_1.Neg(D6),
                new dice_1.Abs(new dice_1.Neg(D6)),
                new dice_1.Mod(D6, 3),
                new dice_1.Div(D6, 2),
                new dice_1.Mult(10, COIN),
                new dice_1.Cond(COIN, D6, TWO),
                new dice_1.Or([D6, TWO, COIN]),
                new dice_1.Eq(D6, TWO),
                new dice_1.Ne(D6, TWO),
                new dice_1.Lt(D6, TWO),
                new dice_1.Le(D6, TWO),
                new dice_1.Gt(D6, TWO),
                new dice_1.Ge(D6, TWO),
                new dice_1.Geometric(1 / 2),
                new dice_1.Geometric(1 / 100),
            ];
            if (true) {
                for (let r of TESTS) {
                    console.log(`${verify(r) ? 'PASS' : 'FAIL'}\t: ${r}`);
                }
            }
        }
    };
});
//# sourceMappingURL=tsc.js.map