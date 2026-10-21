import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Tuned = v.object({ tune: v.primitives.hallucination.Tier.desc('A tier. Example: "fast"') });
const Effortful = v.object({ effort: v.enum(belt.intelligent.EFFORTS).desc('Reasoning effort. Example: "high"') });
const Rounded = v.object({ rounds: v.integer({ minimum: 1, maximum: 50 }).desc("The round budget. Example: 12") });

export const intelligent = new Vector()
  .open(
    { nature: "/tune", valence: "the seated thread's model tier — INTELLIGENT.tune. Example: /tune fast", input: Tuned, chord: "leader/h/t" },
    async (ctx) => {
      const INTELLIGENT = belt.input.cast(Tuned, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { INTELLIGENT }));
      return { INTELLIGENT };
    },
  )
  .open(
    { nature: "/effort", valence: "the seated thread's reasoning effort — INTELLIGENT.effort. Example: /effort high", input: Effortful, chord: "leader/h/e" },
    async (ctx) => {
      const INTELLIGENT = belt.input.cast(Effortful, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { INTELLIGENT }));
      return { INTELLIGENT };
    },
  )
  .open(
    { nature: "/rounds", valence: "the seated thread's round budget — INTELLIGENT.rounds. Example: /rounds 12", input: Rounded, chord: "leader/h/r" },
    async (ctx) => {
      const INTELLIGENT = belt.input.cast(Rounded, ctx.signal);
      await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { INTELLIGENT }));
      return { INTELLIGENT };
    },
  );
