import { errors, NotFound } from "@vivalence/vector/typology";
// import { errors } from "@vivalence/vector";
import { compose, chain, forward } from "./carry.js";
import { greedy } from "./match.js";

// const scope = match.scope(position, signal);
// for (const [matched, trajectory, effect] of match.scope()) {

export function traverse(vector, signals) {
  let position = vector;
  let carry = forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals.array) {
    // console.log();
    const [[match, trajectory, effect] = []] = greedy(position, signal);

    if (!match) throw new errors.NotFound(signal);
    steps.push(match);

    if (match.type === "remainder") {
      match.params = { [remainder++]: match.signature };

      if (signals.length === steps.length) {
        carry = chain(carry, compose(position.carry));
        if (effect) return [effect, carry, position, steps];
      }

      continue;
    }

    carry = chain(carry, compose(position.carry));

    if (effect && trajectory && signals.length !== steps.length) {
      position = trajectory;
      continue;
    }
    if (effect) return [effect, carry, steps, position];
    if (trajectory) position = trajectory;
  }

  return [null, carry, steps, position];
}
