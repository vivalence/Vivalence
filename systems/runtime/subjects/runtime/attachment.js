import paladin from "@vivalence/paladin";
import { fromm, Path, shard, Vector } from "@vivalence/typology";

export const attachment = new Vector();

const seated = (runtime, id) => {
  for (const host of [runtime, ...Object.values(runtime.daemons)]) {
    const held = fromm.modes(host.modes).flat.find((mode) => mode.entity.id === id);
    if (held) return held;
  }
  throw new Error(`[attached/surface] no live mode holds entity ${id}`);
};

const building = new Map();

const bundled = (runtime, surface) => {
  if (!building.has(surface.id)) {
    const mode = seated(runtime, surface.mode.id);
    const bundler = paladin.bundle.directory(new Path(mode.mountpoint).absolute, mode.module.source.dirname);
    const build = surface.mount === null
      ? runtime.entities.file.findOneOrFail({ surface: surface.id, path: surface.entry })
      : runtime.entities.surface.bundle(surface, { bundler });
    building.set(surface.id, build.finally(() => building.delete(surface.id)));
  }
  return building.get(surface.id);
};

attachment.branch("/file/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
  const file = await ctx.runtime.entities.file.findOneOrFail({ id: ctx.params.id });
  ctx.response.type = file.mime;
  ctx.response.headers.set("x-viva-integrity", file.integrity);
  return await paladin.read.bytes(file.mount);
});

attachment.branch("/surface/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
  const surface = await ctx.runtime.entities.surface.findOneOrFail(
    { id: ctx.params.id },
    { populate: ["sources"] },
  );
  const file = await bundled(ctx.runtime, surface);
  ctx.response.headers.set("etag", `"${file.integrity}"`);
  ctx.response.headers.set("x-viva-integrity", file.integrity);
  if (ctx.request.headers.get("if-none-match") === `"${file.integrity}"`)
    return new Response(null, { status: 304, headers: Object.fromEntries(ctx.response.headers) });
  ctx.response.type = file.mime;
  return await paladin.read.bytes(file.mount);
});
