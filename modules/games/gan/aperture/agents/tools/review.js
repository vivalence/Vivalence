import { Type } from "@sinclair/typebox";
export default (trajectory, ctx) =>
  trajectory.open(
    (p) =>
      p.sig({
        path: "/review/annotation",
        valence: `# Review: Updates a hidden representation of our confidence that the learner knows a learnable unit.
	    This method takes one annotation object and a signal of whether the learner knows this unit. `,
        input: Type.Object({
          signal: ctx.runtime.schema.signal,
          annotation: ctx.runtime.schema.annotation,
        }),
      }),
    async (input, context) => {
      input.scope = { game: context.game.manifest.slug };
      await ctx.runtime.call("/review/annotation", input);
    },
  );
