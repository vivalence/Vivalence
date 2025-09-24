import { NotFound } from "../types/errors.js";
import { compose, chain, forward } from "./middleware.js";
import { match } from "./match.js";

export function traverse(vector, signals) {
  let position = vector;
  let apply = forward;
  let steps = [];
  let remainder = 0;

  for (const signal of signals) {
    const [matched, trajectory, effect] = match(position, signal);
    if (!matched) throw new NotFound(signal);
    steps.push(matched);

    if (matched.type === "remainder") {
      matched.params = {
        [remainder++]: matched.signature,
      };
      if (signals.length === steps.length) {
        apply = chain(apply, compose(position.middlewares));
        if (effect) return [effect, apply, position, steps];
      }
      continue;
    }

    apply = chain(apply, compose(position.middlewares));

    if (effect && trajectory && signals.length !== steps.length) {
      position = trajectory;
      continue;
    }
    if (effect) return [effect, apply, position, steps];
    if (trajectory) position = trajectory;
  }

  return [null, apply, position, steps];
}
