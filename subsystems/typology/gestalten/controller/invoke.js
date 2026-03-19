import { Signal, fromm } from "@vivalence/typology";
import { NotFound } from "@vivalence/typology";
import { traverse } from "./traverse.js";

export const strategy = (carry, effect, steps, signal) => async (input) => {
  const ctx = { input, signal, params: fromm.match(steps).parameters };
  await carry(ctx, async (c) => {
    c.output = await effect(c);
  });
  return ctx.output;
};

export function invoke(vector, signal, execute = strategy) {
  signal = new Signal(signal);
  const [effect, carry, steps] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return execute(carry, effect, steps, signal);
}
