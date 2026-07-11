import { App, Vector, v, Span } from "@vivalence/typology";

export const aperture = new Vector().open(
  { nature: "/ask", input: v.object({ prompt: v.string(), thread: v.string() }) },
  async (ctx) => {
    const span = new Span("aperture/ask").open();
    span.branch("input").note(ctx.input);
    try {
      const render = await ctx.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
        output: v.object({ answer: v.string() }),
      });
      span.branch("render").note(render);
      const { object } = render;

      const userTurn = await ctx.daemon.entities.turn.chain({
        role: "user",
        parts: [{ type: "text", text: ctx.input.prompt }],
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });

      const assistantTurn = await ctx.daemon.entities.turn.chain({
        role: "assistant",
        parts: [
          { type: "text", text: object?.answer ?? "" },
          { type: "object", data: object },
        ],
        parent: userTurn,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });

      span.branch("turn/user").note(userTurn);
      span.branch("turn/assistant").note(assistantTurn);
      span.close();

      return { answer: object.answer, trace: span.records };
    } catch (error) {
      span.close().branch("render").fault(error);
      return { answer: `… the oracle falters: ${error.message}`, trace: span.records };
    }
  },
);
