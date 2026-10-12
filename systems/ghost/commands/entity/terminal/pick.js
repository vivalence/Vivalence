import { v, Vector } from "@vivalence/typology";

export const pick = new Vector().open(
  {
    nature: "/terminal/:id",
    valence: "pick a terminal — the seat derives from it. Example: /terminal/t9",
    schema: v.object({ id: v.string().desc("the terminal id. Example: t9") }),
  },
  (ctx) => ({ terminal: ctx.client.terminals.activate(ctx.params.id).id }),
);
