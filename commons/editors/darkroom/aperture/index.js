import { join } from "@std/path";
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import paladin from "@vivalence/paladin";
import { Vector, crypto, mime, v } from "@vivalence/typology";
import { Settings } from "../schematics.js";

const Desk = v.object({ buffer: v.string().desc('The desk buffer. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"') });

const desk = (ctx, id) => ctx.entities.buffer.findOneOrFail({ id }, { populate: ["files"] });

const part = async (ctx, id) => {
  const file = await ctx.entities.file.findOneOrFail({ id });
  const bytes = await paladin.read.bytes(file.mount);
  return { type: "image", media: file.mime, data: encodeBase64(bytes) };
};

const filed = async (ctx, buffer, folder, type, bytes) => {
  const path = `${folder}/${await crypto.digestBytes(bytes)}.${mime.extension(type)}`;
  const mount = join(ctx.mode.mountpoint.absolute, path);
  await paladin.state.store(mount, bytes);
  const file = await ctx.entities.file.record({ mode: ctx.mode.id, path, mount, mime: type, bytes });
  buffer.files.add(file);
  return file;
};

export const aperture = new Vector()
  .open({ nature: "/picture/settle", input: v.object({ buffer: Desk.properties.buffer, data: Settings }), output: v.buffer() }, async (ctx) => {
    const buffer = await desk(ctx, ctx.input.buffer);
    buffer.data = Settings.cast(ctx.input.data);
    await ctx.entities.em.flush();
    return buffer;
  })
  .open({ nature: "/picture/hallucinate", input: Desk, output: v.buffer() }, async (ctx) => {
    const buffer = await desk(ctx, ctx.input.buffer);
    const held = buffer.data;
    const parent = held.next === "iterate" ? held.shown : null;
    const seed = parent ? [{ role: "init", image: await part(ctx, parent) }] : [];
    const references = await Promise.all(held.references.map(async ({ file, role }) => ({ role, image: await part(ctx, file) })));
    const rendered = await ctx.mode.harness.picture.render({
      thread: buffer.thread.id,
      id: held.model,
      prompt: held.prompt,
      images: [...seed, ...references],
      settings: { aspect: held.aspect, count: held.count },
    });
    const pictures = [];
    for (const image of rendered.images) {
      const file = await filed(ctx, buffer, "pictures", image.media, decodeBase64(image.data));
      pictures.push({ file: file.id, prompt: held.prompt, parent, references: held.references, model: held.model, aspect: held.aspect });
    }
    buffer.data = { ...held, prompt: "", pictures: [...held.pictures, ...pictures], shown: pictures[0].file };
    await ctx.entities.em.flush();
    return buffer;
  })
  .open({ nature: "/picture/upload/:buffer", output: v.file() }, async (ctx) => {
    const buffer = await desk(ctx, ctx.params.buffer);
    const bytes = new Uint8Array(await new Response(ctx.request.raw.body).arrayBuffer());
    const file = await filed(ctx, buffer, "references", ctx.request.headers.get("content-type"), bytes);
    await ctx.entities.em.flush();
    return file;
  });
