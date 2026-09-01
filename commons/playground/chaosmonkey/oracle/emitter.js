import { App, Vector, Span, v } from "@vivalence/typology";

export const emitter = new Vector().open(
  { nature: "/vision", input: v.object({ prompt: v.string(), thread: v.string().optional() }) },
  async (ctx) => {
    const span = new Span("oracle/emitter/vision").open().note({ input: ctx.input });

    const vision = ctx.daemon.modes.chaosmonkey.vision;

    const render = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
      output: v.object({
        vision: v
          .string()
          .desc("a vivid, faintly ominous one-line vision of what they asked about"),
        mood: v.string().desc("one-word mood of the vision"),
      }),
    });
    span.note({ render }).close();

    const buffer = vision.app.buffer({
      data: { prompt: ctx.input.prompt, ...render.output.object },
    });

    ctx.pool.add(buffer);

    console.log({ render, span: span.records, buffer });

    return { span: span.records, object: render.output.object };
  },
);
