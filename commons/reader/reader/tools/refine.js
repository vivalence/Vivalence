import { v, Vector } from "@vivalence/typology";

const REFINE = [
  "You rewrite the html of an article in a reader, by the user's instructions.",
  "Keep every data-block and data-done attribute on the elements you keep.",
  "Give each new top-level element a data-block id not yet used.",
  "Return the whole html.",
].join("\n");

export const rewrite = async (ctx, id, instructions) => {
  const buffer = await ctx.entities.buffer.findOneOrFail({ id });
  const { output } = await ctx.mode.harness.object.render({
    thread: buffer.thread.id,
    turns: [
      { role: "system", parts: [{ type: "text", text: REFINE }] },
      { role: "user", parts: [{ type: "text", text: instructions }] },
      { role: "user", parts: [{ type: "text", text: buffer.data.article.html }] },
    ],
    output: v.object({ html: v.string() }),
  });
  buffer.data = {
    ...buffer.data,
    article: {
      ...buffer.data.article,
      parse: "agentic",
      html: output.object.html,
    },
  };
  await ctx.entities.em.flush();
  return buffer;
};

export const refine = new Vector().open(
  {
    nature: "/reader/refine",
    valence: "Rewrite the article in a reader buffer by instructions. Example: { instructions: 'drop the cookie banner' }",
    input: v.object({
      buffer: v.string().desc('The reader buffer. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"'),
      instructions: v.string().desc("What to change. Example: drop the cookie banner, write alt text"),
    }),
  },
  async (ctx) => ({ output: { buffer: (await rewrite(ctx, ctx.input.buffer, ctx.input.instructions)).id } }),
);
