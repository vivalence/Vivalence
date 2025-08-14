import { Long, Short } from "../types/errors.js";
import { traverse } from "./traverse.js";
import { forward, chain, compose } from "../middleware.js";

export async function walk(vector, getSignal) {
  let position = vector;
  let apply = forward;
  let steps = [];

  while (true) {
    if (steps.length >= 20) throw new Long();
    const signals = await getSignal(position.patterns);
    if (signals.length === 0) throw new Short();

    const [effect, bundle, trajectory, moved] = traverse(position, signals);

    apply = chain(apply, bundle);
    steps.push(...moved);

    if (effect) return [effect, apply, trajectory, steps];

    position = trajectory;
  }
}
