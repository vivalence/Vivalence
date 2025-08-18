import { NotFound } from "../types/errors.js";
import { compose, chain, forward } from "../middleware.js";
import { match } from "./match.js";

export function traverse(vector, signals) {
  let position = vector;
  let apply = forward;
  let steps = [];

  for (const signal of signals) {
    const [isMatch, trajectory, effect] = match(position, signal);
    if (!isMatch) throw new NotFound(signal);
    apply = chain(apply, compose(position.middlewares));
    steps.push(isMatch);

    if (effect) return [effect, apply, position, steps];
    if (trajectory) position = trajectory;
  }

  return [null, apply, position, steps];
}
