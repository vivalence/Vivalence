import { middleware } from "@vivalence/typology";
import { scope, resolve } from "./match.js";

export function traverse(vector, signals) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals.array) {
    const [match, trajectory, effect] = resolve(scope(position, signal), signal);

    steps.push(match);

    if (match.type === "remainder") {
      match.params = { [remainder++]: match.signature }; // why incoherent with patternamp?
      match.parameters = { [remainder++]: match.signature }; //

      if (signals.length === steps.length) {
        carry = middleware.chain(carry, middleware.compose(position.carry));
        if (effect) return [effect, carry, position, steps];
      }

      continue;
    }

    carry = middleware.chain(carry, middleware.compose(position.carry));

    if (effect && trajectory && signals.length !== steps.length) {
      position = trajectory;
      continue;
    }
    if (effect) return [effect, carry, steps, position];
    if (trajectory) position = trajectory;
  }

  return [null, carry, steps, position];
}
