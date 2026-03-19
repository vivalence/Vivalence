import { Long, Short } from "@vivalence/typology";
import { middleware } from "@vivalence/typology";
import { traverse } from "./traverse.js";

export async function walk(vector, more) {
  let position = vector;
  let carry = middleware.forward;
  let steps = [];
  let signal;

  while (position.patterns.length) {
    if (steps.length >= 20) throw new Long();
    if (!signal?.nature) signal = await more(position.patterns);
    if (!signal.nature) throw new Short(position);

    const [effect, luggage, path, trajectory] = traverse(position, signal);

    carry = middleware.chain(carry, luggage);
    steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
