import { App, Vector, v } from "@vivalence/typology";

export const aperture = new Vector().open(
  { nature: "/ask", input: v.object({ prompt: v.string(), thread: v.string().optional() }) },
  async (ctx) => {
    const render = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
      output: v.object({ answer: v.string() }),
    });
    console.log({ input: ctx.input, render });
    const { object } = render;

    // manual, daemon-side — the aperture handler owns the whole round trip,
    // so it registers both turns itself, right here.
    if (ctx.input.thread) {
      const userTurn = await ctx.daemon.entities.turn.chain({
        role: "user",
        parts: [{ type: "text", text: ctx.input.prompt }],
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });

      await ctx.daemon.entities.turn.chain({
        role: "assistant",
        parts: [
          { type: "text", text: object?.answer ?? "" },
          { type: "object", data: object },
        ],
        parent: userTurn,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });
    }

    return { answer: object?.answer ?? "" };
  },
);
