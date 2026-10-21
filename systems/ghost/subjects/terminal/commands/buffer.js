import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Labeled = v.object({ name: v.string().desc('The buffer\'s label. Example: "memo #1"') });

const named = (buffer) => buffer.trait.LABELED.name;

export const buffer = new Vector().open(
  { nature: "/buffer", valence: "a buffer of the seated thread into the frame, by its label. Example: /buffer \"memo #1\"", input: Labeled, chord: "leader/e/b" },
  (ctx) => {
    const { name } = belt.input.cast(Labeled, ctx.signal);
    const held = ctx.terminal.thread.$buffers.get();
    const found = held.find((candidate) => named(candidate) === name);
    if (found === undefined) throw new Error(`no buffer ${name} on thread #${ctx.terminal.thread.id} — its buffers: ${held.map(named).join(" · ") || "none"}`);
    ctx.terminal.$buffer.set(found);
    return `buffer #${found.id} · ${name}`;
  },
);
