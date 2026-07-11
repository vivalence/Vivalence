import { App, Vector, v, Span } from "@vivalence/typology";

export const aperture = new Vector().open(
  { nature: "/ask", input: v.object({ prompt: v.string(), thread: v.string().optional() }) },
  async (ctx) => {
    const span = new Span("ask").open();
    span.note({ prompt: ctx.input.prompt });
    const render = span.branch("render").open();
    try {
      const { object } = await ctx.mode.harness.object.render({
        turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
        output: v.object({ answer: v.string() }),
      });
      render.note({ object }).close();

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
        span.note({ persisted: { thread: ctx.input.thread } });
      }

      span.close();
      return { answer: object?.answer ?? "", trace: span.records };
    } catch (error) {
      render.fault(error).close();
      span.close();
      return { answer: `… the oracle falters: ${error.message}`, trace: span.records };
    }
  },
);
