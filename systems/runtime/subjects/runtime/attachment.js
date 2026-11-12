import paladin from "@vivalence/paladin";
import { fromm, Path, shard, Vector } from "@vivalence/typology";

export const attachment = new Vector();

const seated = (runtime, id) => {
  for (const host of [runtime, ...Object.values(runtime.daemons)]) {
    const held = fromm.modes(host.modes).flat.find((mode) => mode.entity.id === id);
    if (held) return held;
  }
  throw new Error(`[attached/view] no live mode holds entity ${id}`);
};

const building = new Map();

const bundled = (runtime, view) => {
  if (!building.has(view.id)) {
    const mode = seated(runtime, view.mode.id);
    const bundler = paladin.bundler(new Path(mode.mountpoint).absolute, mode.module.source.dirname);
    const build = view.mount === null
      ? runtime.entities.file.findOneOrFail({ view: view.id, path: view.entry })
      : runtime.entities.view.bundle(view, { bundler });
    building.set(view.id, build.finally(() => building.delete(view.id)));
  }
  return building.get(view.id);
};

attachment.branch("/file/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
  const file = await ctx.runtime.entities.file.findOneOrFail({ id: ctx.params.id });
  ctx.response.type = file.mime;
  ctx.response.headers.set("x-viva-integrity", file.integrity);
  return await paladin.read.bytes(file.mount);
});

attachment.branch("/view/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
  const view = await ctx.runtime.entities.view.findOneOrFail(
    { id: ctx.params.id },
    { populate: ["sources"] },
  );
  const file = await bundled(ctx.runtime, view);
  ctx.response.headers.set("etag", `"${file.integrity}"`);
  ctx.response.headers.set("x-viva-integrity", file.integrity);
  if (ctx.request.headers.get("if-none-match") === `"${file.integrity}"`)
    return new Response(null, { status: 304, headers: Object.fromEntries(ctx.response.headers) });
  ctx.response.type = file.mime;
  return await paladin.read.bytes(file.mount);
});
