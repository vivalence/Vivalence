import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { gestalten } from "@vivalence/runtime";
import { v, Vector } from "@vivalence/typology";

const transcribe = new Vector().open(
  {
    nature: "/file/transcribe",
    valence:
      "Transcribe an audio file of this thread into a text file. Pass the id from an " +
      "[attached audio · file <id> …] line. Returns the text file. " +
      'Example: { file: "01a21d5b-973b-7239-bd7c-648ef0893b15" }',
    input: v.object({
      file: v
        .string()
        .desc('The audio file\'s id. Example: "01a21d5b-973b-7239-bd7c-648ef0893b15"'),
    }),
  },
  async (ctx) => {
    const heard = await ctx.mode.harness.verbatim.render({
      thread: ctx.thread,
      turns: [{ role: "user", parts: [{ type: "file", file: ctx.input.file }] }],
    });
    const text = heard.turns.at(-1).parts.map((part) => part.text).join("\n");
    const landed = await paladin.write.stream(
      ctx.mode.mountpoint,
      { path: join("files", "verbatim"), mime: "text/plain" },
      new Blob([text]).stream(),
    );
    const file = await ctx.entities.file.upload({
      ...landed,
      mode: ctx.mode.id,
      user: ctx.user.id,
      thread: ctx.thread,
    });
    return { product: { file: [{ id: file.id, mime: file.mime }] } };
  },
);

export const tools = new Vector()
  .graft(gestalten.tools.thread, gestalten.tools.entity, gestalten.tools.buffer)
  .graft(gestalten.tools.modes, gestalten.tools.tool)
  .graft(paladin.tools.fs, paladin.tools.shell)
  .graft(transcribe);
