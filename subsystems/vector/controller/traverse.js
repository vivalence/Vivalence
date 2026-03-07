import { errors, NotFound } from "@vivalence/vector/typology";
import { compose, chain, forward } from "./carry.js";
import { scope } from "./match.js";

export function traverse(vector, signals) {
  let position = vector;
  let carry = forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals.array) {
    const matches = scope(position, signal);

    let match, trajectory, effect;
    if (matches.length === 0) throw new NotFound(signal);
    else if (matches.length === 1) [match, trajectory, effect] = matches[0];
    else if (matches.length === 2) {
      if (signal.heir) [match, trajectory] = matches.find((match) => !!match[1]);
      else [match, , effect] = matches.find((match) => !!match[2]);
    }

    steps.push(match);

    if (match.type === "remainder") {
      match.params = { [remainder++]: match.signature }; // why incoherent with patternamp?
      match.parameters = { [remainder++]: match.signature }; //

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
