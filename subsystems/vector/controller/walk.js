import { is } from "@vivalence/typology";
import { Long, Short } from "../types/errors.js";
import { traverse } from "./traverse.js";
import { forward, chain, compose } from "./carry.js";

export async function walk(vector, signal, more) {
  let position = vector;
  let carry = forward;
  let steps = [];

  while (position.heir) {
    if (steps.length >= 20) throw new Long();
    console.log("pre", signal.signature);
    if (!signal?.signature) signal = await more(position.patterns);
    console.log("post", signal.signature);
    if (!signal.signature) throw new Short(position);

    const [effect, luggage, path, trajectory] = traverse(position, signal);

    carry = chain(carry, luggage);
    steps.push(...path);
    if (effect) return [effect, carry, steps, trajectory];
    position = trajectory;
  }
}
