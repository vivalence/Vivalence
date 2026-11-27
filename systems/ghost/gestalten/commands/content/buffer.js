import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const Labeled = v.object({ name: v.string().desc('The buffer\'s label. Example: "memo #1"') });

const named = (buffer) => buffer.trait.LABELED.name;

const Fulled = v.object({ name: v.string().optional().desc('The buffer\'s label, the rest of the line; absent is the framed buffer. Example: "memo #1"') });

const FOUND = [
  [(name) => name === undefined, (ctx) => ctx.terminal.buffer],
  [() => true, (ctx, name) => ctx.terminal.thread.$buffers.get().find((candidate) => named(candidate) === name)],
];

const VIEWED = [
  [(ctx, found) => ctx.terminal.buffer === found && ctx.terminal.dock.view === "closed", () => "docked"],
  [() => true, () => "closed"],
];


const REOPENED = [
  [(view) => view === "closed", async (ctx) => {
    const DOCKED = { view: "docked" };
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
  }],
  [() => true, async () => {}],
];

export const buffer = new Vector().open(
  { nature: "/buffer", rank: "hidden", valence: "a buffer of the seated thread into the frame, by its label. Example: /buffer \"memo #1\"", input: Labeled, chord: "leader/e/b" },
  async (ctx) => {
    const { name } = belt.input.cast(Labeled, belt.input.lined(ctx.signal));
    const held = ctx.terminal.thread.$buffers.get();
    const found = held.find((candidate) => named(candidate) === name);
    if (found === undefined) throw new Error(`no buffer ${name} on thread #${ctx.terminal.thread.id} — its buffers: ${held.map(named).join(" · ") || "none"}`);
    await ctx.terminal.setBuffer(found);
    return `buffer #${found.id} · ${name}`;
  },
).open(
  { nature: "/buffer/new", valence: "a new buffer on the seated thread, framed. Example: /buffer/new" },
  async (ctx) => {
    const made = await ctx.client.runtime.entities.buffer.create({ thread: ctx.terminal.thread.id, mode: ctx.terminal.mode.id });
    await ctx.terminal.setBuffer(made);
    return `buffer #${made.id} · ${named(made)}`;
  },
).open(
  { nature: "/buffer/close", rank: "hidden", valence: "close the frame; the buffer stays on its thread. Example: /buffer/close", chord: "leader/e/u" },
  async (ctx) => {
    if (ctx.terminal.buffer === null) throw new Error("no frame open");
    const view = ctx.terminal.dock.view;
    await ctx.terminal.setBuffer(null);
    await REOPENED.find(([test]) => test(view))[1](ctx);
    return "frame closed";
  },
).open(
  { nature: "/buffer/delete", rank: "hidden", valence: "the framed buffer removed from its thread; the frame closes. Example: /buffer/delete" },
  async (ctx) => {
    if (ctx.terminal.buffer === null) throw new Error("no frame open");
    const gone = ctx.terminal.buffer;
    await ctx.terminal.setBuffer(null);
    await ctx.client.runtime.entities.buffer.removeOne({ id: gone.id });
    return `buffer "${gone.trait.LABELED.name}" removed`;
  },
).open(
  { nature: "/buffer/full", rank: "hidden", valence: "the buffer fullscreen in the frame, or back to the dock. Example: /buffer/full memo #1", input: Fulled },
  async (ctx) => {
    const { name } = belt.input.cast(Fulled, belt.input.lined(ctx.signal));
    const found = FOUND.find(([test]) => test(name))[1](ctx, name);
    if (found === undefined || found === null)
      throw new Error(name === undefined ? "no frame open" : `no buffer ${name} on thread #${ctx.terminal.thread.id} — its buffers: ${ctx.terminal.thread.$buffers.get().map(named).join(" · ") || "none"}`);
    const view = VIEWED.find(([test]) => test(ctx, found))[1]();
    await ctx.terminal.setBuffer(found);
    const DOCKED = { view };
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
    return { DOCKED };
  },
);
