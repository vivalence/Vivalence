import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Docking = v.object({ word: v.enum([...belt.dock.SIDES, ...belt.dock.VIEWS]).desc('A side the dock sits, or how it shows. Example: "closed"') });
const Lensed = v.object({ lens: v.enum(belt.dock.LENSES).desc('Which stream the dock paints. Example: "trace"') });
const Shared = v.object({ share: v.number({ minimum: 0.1, maximum: 0.9 }).desc("The dock's width as a share of the chrome. Example: 0.38") });

const DOCKINGS = [
  [(word) => belt.dock.SIDES.includes(word), (word) => ({ align: word })],
  [(word) => word === "closed", () => ({ view: "closed" })],
  [(word) => belt.dock.VIEWS.includes(word), (word) => ({ view: word, shown: word })],
];

const docking = (word) => DOCKINGS.find(([test]) => test(word))[1](word);

export const dock = new Vector()
  .open(
    { nature: "/dock", valence: "the dock: its side, or how it shows — docked · full · closed · messenger. Example: /dock closed", input: Docking, chord: "leader/d/d" },
    async (ctx) => {
      const { word } = belt.input.cast(Docking, ctx.signal);
      const DOCKED = docking(word);
      await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
      return { DOCKED };
    },
  )
  .open(
    { nature: "/dock/lens", valence: "what the dock lists: chat is turns, trace is records, repl is both. Example: /dock/lens trace", input: Lensed, chord: "leader/d/j" },
    async (ctx) => {
      const DOCKED = belt.input.cast(Lensed, ctx.signal);
      await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
      return { DOCKED };
    },
  )
  .open(
    { nature: "/split", valence: "the divider — the dock's share of the chrome. Example: /split 0.5", input: Shared, chord: "leader/d/s" },
    async (ctx) => {
      const DOCKED = belt.input.cast(Shared, ctx.signal);
      await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED }));
      return { DOCKED };
    },
  );
