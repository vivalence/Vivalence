import { Vector, v } from "@vivalence/typology";
import { help as belt } from "../gestalten/belt/index.js";

export const help = new Vector().open(
  {
    nature: "/help",
    valence: "the repl's verbs, or those under a prefix. Example: help instance",
    schema: v.object({ prefix: v.string().desc("narrows the listing. Example: instance").optional() }),
  },
  async (ctx) => {
    const commands = belt.named(belt.census(ctx.repl), ctx.signal.body[0] ?? "");
    await ctx.view.emit("listing", belt.listing(commands, ctx.flags));
    return { commands, flags: ctx.flags };
  },
);
