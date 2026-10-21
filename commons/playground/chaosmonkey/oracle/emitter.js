import { Span, v, Vector } from "@vivalence/typology";

export const emitter = new Vector().open(
  {
    nature: "/vision",
    input: v.object({ prompt: v.string(), thread: v.string() }),
  },
  async (ctx) => {
    const span = new Span("oracle/emitter/vision").start().log({
      input: ctx.input,
    });

    const vision = ctx.modes.chaosmonkey.vision;

    const render = await ctx.mode.harness.object.render({
      thread: ctx.input.thread,
      turns: [{
        role: "user",
        parts: [{ type: "text", text: ctx.input.prompt }],
      }],
      output: v.object({
        vision: v
          .string()
          .desc(
            "a vivid, faintly ominous one-line vision of what they asked about",
          ),
        mood: v.string().desc("one-word mood of the vision"),
      }),
    });
    span.log({ render }).stop();

    const buffer = await vision.buffer({
      data: { prompt: ctx.input.prompt, ...render.output.object },
    });

    ctx.pool.add(buffer);

    console.log({ render, span: span.history, buffer });

    return { span: span.history, object: render.output.object };
  },
);
