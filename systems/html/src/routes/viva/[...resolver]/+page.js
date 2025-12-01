import { Signal } from "@vivalence/typology"; // Context
import { controller, Context, NotFound } from "@vivalence/vector";
import { Stall } from "@vivalence/drapes";
import { generator, stall } from "$client";
// todo import { resolver } from "@client/generator";

export const load = async (event) => {
  const signal = new Signal(event.url.pathname);

  const [generate, apply, steps] = controller.traverse(generator, signal);
  if (!generate) throw new NotFound(signal);

  stall.withPull(async () => {
    const context = new Context({
      stall,
      signal,
      steps,
      // params: signature.params(signal),
      query: Object.fromEntries(event.url.searchParams),
    });

    await apply(context, async (ctx) => (ctx.generation = await generate(ctx)));

    return context.generation || [];
  });

  return { stall };
};
