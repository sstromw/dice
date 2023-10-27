# Dice Roller and Probability Calculator Webapp

(made by Sam)

This project is incomplete, but these are the features I'm working on.

- Roll arbitrary dice. Here "dice" means any discrete random variable
    - uniform, binomial, geometric, Poisson, etc.
    - sums, products, minimums, maximums, etc.
- Calculate statistical information for your "dice".
    - probability tables (TODO sam get plotly.js working)
    - means, variances, medians, percentiles, entropy, etc.

## Guide to dice notation

As a quickstart example, if you put `2d4 + d5 - 1` into the box, the parser
will interpret "roll two 4-sided dice and one 5-sided dice, subtract one, and
produce the sum".

We ignore whitespace and is case-insensitive. Writing `2 D4 +D5 -1` gives the
same result.

### `d`-Type and Constant Rolls

`d<n>` refers to an `n`-sided die with values `1, 2, ..., n`, each equally
likely. An integer constant `m` will always produce that constant.

### Operators

Operators have a functional form and an infix form. All functions support an
arbitrary number of parameters, and each operator is associative.

| Description | Function | Operator |
| ----------- | -------- | -------- |
| Roll `R1` and `R2` and produce the sum | `sum(R1,R2)` | `R1 + R2` |
| Roll `R1` and `R2` and produce the product | `prod(R1,R2)` | `R1 * R2` |
| Roll `R1` and `R2` and produce the higher of the two | `max(R1,R2)` | `R1 >> R2` |
| Roll `R1` and `R2` and produce the lower of the two | `min(R1,R2)` | `R1 << R2` |
| Choose one of the operands uniformly at random and roll that | `or(R1,R2,R3,R4)` | `R1 | R2 | R3 | R4` |
| Roll `T`. Roll `R1` if the result is greater than 0 and roll `R2` otherwise. Produce this second roll. | `cond(T,R1,R2)` | `T ? R1 : R2` |

### A note on multiplication

In the world of random variables, constant multiplication and repeated addition
are distinct, so `2 * d6` refers to rolling one `d6` and doubling the result
while `2 d6` refers to rolling two `d6` and adding the results.

The shorthand `n(R)` for adding `n` copies of `R` works for all rolls, but the
shorthand without the parentheses only works for `d`-type rolls (i.e. `2d6` is
valid but `2 2` is not)

### Coins and Comparison Operators

Rolling a coin produces either 0 or 1. A coin is denoted with `c(q)`, where
0 <= `q` <= 1 is the probability of rolling a 1. Shorthands `c()` and `c` refer
to a fair coin. A binomial distribution with `n` trials and probability `q` is
simply `n(c(q))`.

Comparison operators will also produce a 0 or 1. For instance, `R1 = R2` refers
to a die that rolls `R1` and `R2` and produces 1 if and only if the results are
equal. Similarly with other operators.

*   `R1 = R2`
*   `R1 != R2`
*   `R1 < R2`
*   `R1 <= R2`
*   `R1 > R2`
*   `R1 >= R2`

Comparison operators and coins are useful as the condition operator of `cond`.

### Geometric and Poisson distributions

The geometric distribution is denoted `g(q)`. These can produce any positive
integer, but for calculating statistics the library rounds off the last 0.0001%
chance. Things might start to crunch a little if you use `1000(g(0.0001))`.

The Poisson distribution is denoted `Pois(L)` for positive parameter `L`. This
has no analog to physical dice. For numerical stability, this isn't actually
implemented.