import { Signal } from "@vivalence/typology";
import { NotFound } from "@vivalence/vector/typology";
import { traverse } from "./traverse.js";

export async function invoke(vector, signal, context = { signal }) {
  signal = new Signal(signal);
  const [effect, apply, path] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  context.path = path;
  context.signal = signal;
  await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
  return context.effect;
}
