import { Signal } from "@vivalence/typology";
import { NotFound } from "../types/errors.js";
import { traverse } from "./traverse.js";

export async function invoke(vector, signal, context = { signal }) {
  signal = new Signal(signal);
  const [effect, apply, path] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  context.path = path;
  await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
  return context.effect;
}
