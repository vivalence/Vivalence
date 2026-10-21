import { Span, v, Vector } from "@vivalence/typology";

export const aperture = new Vector().open(
  {
    nature: "/ask",
    input: v.object({ prompt: v.string(), thread: v.string() }),
  },
  async (ctx) => {
    const span = new Span("aperture/ask").start();
    span.branch("input").log(ctx.input);
    try {
      const render = await ctx.mode.harness.object.render({
        thread: ctx.input.thread,
        turns: [{
          role: "user",
          parts: [{ type: "text", text: ctx.input.prompt }],
        }],
        output: v.object({ answer: v.string() }),
      });
      span.branch("render").log(render);
      const object = render.output.object;

      const userTurn = await ctx.entities.turn.chain({
        role: "user",
        parts: [{ type: "text", text: ctx.input.prompt }],
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });

      const assistantTurn = await ctx.entities.turn.chain({
        role: "assistant",
        parts: [
          { type: "text", text: object?.answer ?? "" },
          { type: "object", data: object },
        ],
        parent: userTurn,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });

      span.branch("turn/user").log(userTurn);
      span.branch("turn/assistant").log(assistantTurn);
      span.stop();

      return { answer: object.answer, trace: span.history };
    } catch (error) {
      span.stop().branch("render").fault(error);
      return {
        answer: `… the oracle falters: ${error.message}`,
        trace: span.history,
      };
    }
  },
);
