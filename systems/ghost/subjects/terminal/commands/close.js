import { Vector, traits } from "@vivalence/typology";
import { buffer } from "./buffer.js";

const REOPENED = [
  [(view) => view === "closed", async (ctx) => {
    const DOCKED = { view: "docked" };
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
  }],
  [() => true, async () => {}],
];

export const close = new Vector().graft(buffer).open(
  { nature: "/buffer/close", valence: "close the frame; the buffer stays on its thread. Example: /buffer/close", chord: "leader/e/u" },
  async (ctx) => {
    if (ctx.terminal.buffer === null) throw new Error("no frame open");
    const view = ctx.terminal.dock.view;
    ctx.terminal.$buffer.set(null);
    await REOPENED.find(([test]) => test(view))[1](ctx);
    return "frame closed";
  },
).open(
  { nature: "/buffer/delete", valence: "the framed buffer removed from its thread; the frame closes. Example: /buffer/delete" },
  async (ctx) => {
    if (ctx.terminal.buffer === null) throw new Error("no frame open");
    const gone = ctx.terminal.buffer;
    ctx.terminal.$buffer.set(null);
    await ctx.client.runtime.entities.buffer.removeOne({ id: gone.id });
    return `buffer "${gone.trait.LABELED.name}" removed`;
  },
);
