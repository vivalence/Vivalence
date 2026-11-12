import { encodeBase64 } from "@std/encoding/base64";
import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { Settings } from "../schematics.js";

export const tools = new Vector().open(
  {
    nature: "/transcribe",
    valence:
      "Read a scan word for word — a scanned pdf, or a photo or image of a page. " +
      "The words come back in the engine's order, page after page; a page set in " +
      "columns may read across them. " +
      'Example: { file: "01a1b1c0-e5fa-776b-b1aa-1ec226521760" } → message: "Tide Tables The tide rises twice a day at Brest."',
    input: v.object({
      file: v.string().desc('The File to read, by id. Example: "01a1b1c0-e5fa-776b-b1aa-1ec226521760"'),
      language: Settings.properties.language,
    }),
  },
  async (ctx) => {
    const { file: id, ...settings } = ctx.input;
    const file = await ctx.entities.file.findOneOrFail({ id });
    const source = {
      type: file.mime.startsWith("image/") ? "image" : "document",
      media: file.mime,
      data: encodeBase64(await paladin.read.bytes(file.mount)),
    };
    const blocks = await Array.fromAsync(ctx.service(source, settings));
    return { product: { message: blocks.map((block) => block.text).join(" ") } };
  },
);
