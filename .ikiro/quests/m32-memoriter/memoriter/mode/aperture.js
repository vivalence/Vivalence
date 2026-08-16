import { Vector, v } from "@vivalence/typology";
import { progress } from "./progress.js";

export const aperture = new Vector()
  .open(
    {
      nature: "/chat",
      input: v.object({
        prompt: v.string(),
        thread: v.string().optional(),
      }),
      output: v.object({ answer: v.string() }),
    },
    async (ctx) => {
      const render = await ctx.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
        output: v.object({ answer: v.string() }),
        thread: ctx.input.thread,
      });
      if (!render.object?.answer) throw new Error("[memoriter/chat] render.object.answer missing");
      return { answer: render.object.answer, render };
    },
  )
  .open({ nature: "/stats", input: v.object({}) }, (ctx) => progress(ctx.daemon.entities));
