// limit: 2000 chars · on the MIGRATED db copy: a Surface is minted on a real mode, holds a File, is pinned by a
// Buffer; each printed through serialize. args: <renamed typology dir> <mountpoint copy> <db file>
import { defineConfig, MikroORM, serialize } from "@mikro-orm/sqlite";

const [typology, mountpoint, file] = Deno.args;
const entities = await import(`file://${typology}/entities/index.ts`);
const { sets, SurfaceEntity, FileEntity, ModeEntity, BufferEntity } = entities;

const schemas = [
  ...new Set(
    [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]
      .flatMap((tier) => Object.values(tier))
      .map((descriptor) => descriptor.schema),
  ),
];
const orm = await MikroORM.init(
  defineConfig({ dbName: `${mountpoint}/${file}`, loadStrategy: "balanced", entities: schemas }),
);
const em = orm.em.fork();

const mode = await em.findOneOrFail(ModeEntity, { slug: { $ne: null } }, { orderBy: { slug: "ASC" }, filters: false });
const surface = em.create(SurfaceEntity, {
  mode: mode.id,
  slug: "probe",
  mime: "application/vnd.viva.dom.svelte+javascript",
  mount: "buffer/Probe.svelte",
  traits: ["FRAME"],
  entry: "bundle/probe.dom.svelte.mjs",
});
await em.flush();

const built = em.create(FileEntity, {
  mode: mode.id,
  surface: surface.id,
  path: surface.entry,
  mount: "/tmp/probe/bundle/probe.dom.svelte.mjs",
  mime: "text/javascript",
  hash: "b2",
  integrity: "sha256-b2",
  bytes: 12,
});
await em.flush();

const buffer = await em.findOne(BufferEntity, { id: { $ne: null } }, { filters: false });
if (buffer) {
  buffer.surfaces.add(surface);
  await em.flush();
}

em.clear();
const stored = await em.findOneOrFail(SurfaceEntity, { id: surface.id }, { populate: ["files", "buffers"], filters: false });
console.log("== surface");
console.log(JSON.stringify(serialize(stored, { populate: ["files"] }), null, 2));
console.log("== file");
console.log(JSON.stringify(serialize(await em.findOneOrFail(FileEntity, { id: built.id }, { filters: false })), null, 2));
console.log("== pinned by buffers", stored.buffers.getItems().length);

em.remove(stored);
await em.flush();
console.log("== after the surface is removed, its file:", await em.count(FileEntity, { id: built.id }, { filters: false }));
await orm.close(true);
