import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Labeled = v.object({ name: v.string().desc('The buffer\'s label. Example: "memo #1"') });

const named = (buffer) => buffer.trait.LABELED.name;

export const buffer = new Vector().open(
  { nature: "/buffer", valence: "a buffer of the seated thread into the frame, by its label. Example: /buffer \"memo #1\"", input: Labeled, chord: "leader/e/b" },
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
);
