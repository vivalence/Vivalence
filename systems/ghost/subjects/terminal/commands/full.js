import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";
import { buffer } from "./buffer.js";

const Labeled = v.object({ name: v.string().optional().desc('The buffer\'s label, the rest of the line; absent is the framed buffer. Example: "memo #1"') });

const named = (buffer) => buffer.trait.LABELED.name;

const lined = (signal) => ({ ...signal, body: signal.body.length === 0 ? [] : [signal.body.join(" ")] });

const FOUND = [
  [(name) => name === undefined, (ctx) => ctx.terminal.buffer],
  [() => true, (ctx, name) => ctx.terminal.thread.$buffers.get().find((candidate) => named(candidate) === name)],
];

const VIEWED = [
  [(ctx, found) => ctx.terminal.buffer === found && ctx.terminal.dock.view === "closed", () => "docked"],
  [() => true, () => "closed"],
];

export const full = new Vector().graft(buffer).open(
  { nature: "/buffer/full", valence: "the buffer fullscreen in the frame, or back to the dock. Example: /buffer/full memo #1", input: Labeled },
  async (ctx) => {
    const { name } = belt.input.cast(Labeled, lined(ctx.signal));
    const found = FOUND.find(([test]) => test(name))[1](ctx, name);
    if (found === undefined || found === null)
      throw new Error(name === undefined ? "no frame open" : `no buffer ${name} on thread #${ctx.terminal.thread.id} — its buffers: ${ctx.terminal.thread.$buffers.get().map(named).join(" · ") || "none"}`);
    const view = VIEWED.find(([test]) => test(ctx, found))[1]();
    ctx.terminal.$buffer.set(found);
    const DOCKED = { view };
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
    return { DOCKED };
  },
);
