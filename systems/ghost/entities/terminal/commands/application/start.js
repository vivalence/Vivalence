import { Vector } from "@vivalence/typology";
import { open } from "../../../mode/traits/application.js";

export const start = new Vector().open(
  { nature: "/application/start", valence: "open the application of the active terminal's mode in the frame — its newest buffer on this thread, or a new one. Example: /application/start" },
  async (ctx) => {
    if (!ctx.terminal.mode.implements("APPLICATION"))
      throw new Error(`${ctx.terminal.mode.reference.absolute} is not an APPLICATION — its traits: ${ctx.terminal.mode.traits.join(" · ") || "none"}`);
    const buffer = await open(ctx.terminal, ctx.terminal.mode);
    return `application ${ctx.terminal.mode.reference.absolute} · buffer #${buffer.id}`;
  },
);
