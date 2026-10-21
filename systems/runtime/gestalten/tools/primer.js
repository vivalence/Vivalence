import { shape, v, Vector } from "@vivalence/typology";

export const primer = new Vector().open(
  {
    nature: "/primer/read",
    valence: "Reads one deferred section of your primer by its nature, as listed under [primer]. " +
      'Returns { message }. Example: { nature: "guides/render" }',
    input: v.object({ nature: v.string().desc('A nature from the primer index. Example: "guides/render"') }),
  },
  async (ctx) => ({ output: { message: await shape.primer.read(ctx.primer, ctx.input.nature, ctx) } }),
);
