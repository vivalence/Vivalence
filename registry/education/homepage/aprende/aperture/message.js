import { Vector, v } from "@vivalence/typology";
import * as hal from "../hal/index.js";

export const message = new Vector().open(
  {
    nature: "/assistant/message",
    input: v.object({ prompt: v.string(), thread: v.string().optional() }),
    output: v.object({ answer: v.string() }),
  },
  async (ctx) => {
    // console.log("/assistant/message", {
    //   //
    //   input: ctx.daemon.input,
    //   harness: ctx.mode.harness,
    //   tool: ctx.mode.tool,
    //   cortex: ctx.daemon.cortex,
    //   hallucination: ctx.hallucination,
    //   keys: Object.keys(ctx),
    // });
    const render = await ctx.mode.harness.object.render({
      turns: [
        {
          role: "user",
          parts: [{ type: "text", text: ctx.input.prompt }],
        },
      ],
      output: hal.assistant.output,
      thread: ctx.input.thread,
    });
    //
    if (!render.object?.answer) {
      console.error("[aprende/message] render.object.answer missing", { render });
      throw new Error("[aprende/message] render.object.answer missing");
    }
    return { answer: render.object.answer, render };
  },
);
