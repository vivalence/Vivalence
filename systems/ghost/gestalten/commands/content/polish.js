import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const Engaged = v.object({ engaged: v.enum(["on", "off"]).desc('Whether the repair runs. Example: "off"') });

export const polish = new Vector().open(
  {
    nature: "/polish/engaged",
    rank: "hidden",
    valence: "the seated thread's dictation repair on or off — CONVERSATIONAL.polish.engaged. Example: /polish engaged off",
    input: Engaged,
  },
  async (ctx) => {
    const { engaged } = belt.input.cast(Engaged, ctx.signal);
    const CONVERSATIONAL = { polish: { engaged: engaged === "on" } };
    await ctx.client.runtime.entities.thread.updateOne(
      { id: ctx.terminal.thread.id },
      traits.patch(ctx.terminal.thread, { CONVERSATIONAL }),
    );
    return { CONVERSATIONAL };
  },
);
