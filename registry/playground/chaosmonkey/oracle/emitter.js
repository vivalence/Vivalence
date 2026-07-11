import { App, Vector, v } from "@vivalence/typology";

export const emitter = new Vector().open(
  { nature: "/vision", input: v.object({ prompt: v.string(), thread: v.string().optional() }) },
  async (ctx) => {
    const vision = ctx.daemon.modes.chaosmonkey.vision;
    const { object } = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.prompt }] }],
      output: v.object({
        vision: v.string().desc("a vivid, faintly ominous one-line vision of what they asked about"),
        mood: v.string().desc("one-word mood of the vision"),
      }),
    });
    ctx.pool.add(
      vision.buffer({
        data: { prompt: ctx.input.prompt, vision: object?.vision ?? "", mood: object?.mood ?? "" },
      }),
    );
  },
);
