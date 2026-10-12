import { Vector } from "@vivalence/typology";

export const create = new Vector().open(
  { nature: "/terminal/new", valence: "create a terminal and pick it. Example: /terminal/new" },
  async (ctx) => {
    const terminal = ctx.client.terminals.activate(await ctx.client.terminals.create({}));
    return { terminal: terminal.id };
  },
);
