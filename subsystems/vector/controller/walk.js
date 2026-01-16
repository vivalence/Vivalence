import { is } from "@vivalence/typology";
import { Long, Short, NotFound } from "@vivalence/vector/typology";
import { traverse } from "./traverse.js";
import { forward, chain, compose } from "./carry.js";

export async function walk(vector, more) {
  let position = vector;
  let carry = forward;
  let steps = [];
  let signal;

  while (position.heir) {
    if (steps.length >= 20) throw new Long();
    if (!signal?.nature) signal = await more(position.patterns);
    if (!signal.nature) throw new Short(position);

    const [effect, luggage, path, trajectory] = traverse(position, signal);

    carry = chain(carry, luggage);
    steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
