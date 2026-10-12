import { v, Vector } from "@vivalence/typology";

export const open = new Vector().open(
  {
    nature: "/buffer/:id",
    valence: "open a buffer of the seated thread beside the dock. Example: /buffer/b2",
    schema: v.object({ id: v.string().desc("the buffer id. Example: b2") }),
  },
  (ctx) => {
    if (ctx.terminal === null) throw new Error("no terminal picked — /terminal/new");
    const buffer = ctx.runtime.entities.buffer.findOneLocal({ id: ctx.params.id });
    if (buffer === null) throw new Error(`${ctx.params.id}: no such buffer`);
    ctx.terminal.$buffer.set(buffer);
    return { buffer: buffer.id };
  },
);
