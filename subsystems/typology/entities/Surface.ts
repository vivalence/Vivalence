import { types, Collection, EntitySchema, EntityRepositoryType, type Opt, type Rel } from "@mikro-orm/core";
import * as crypto from "../gestalten/belt/crypto.js";
import { Vector } from "../prototypes/vector.js";
import { mime } from "../schematics/scalars/index.js";

import { DataRepository, DataEntity, DataSchema } from "./index.ts";
import { ModeEntity } from "./index.ts";
import { FileEntity } from "./index.ts";
import { BufferEntity } from "./index.ts";

const COMPILED = /\.mjs$/;

export class SurfaceRepository extends DataRepository {
  unique(query) {
    return { mode: query.mode, slug: query.slug, mime: query.mime };
  }

  async bundle(surface, { bundler }) {
    const held = this.em.getRepository(FileEntity);
    const file = await held.findOne({ surface: surface.id, path: surface.entry });
    if (file && (await bundler.fresh(surface.sources))) return file;
    const compiling = await bundler.bundle({ mime: surface.mime, mount: surface.mount, name: surface.entry });
    const [compiled] = compiling.bundle.entries;
    surface.sources = compiling.sources;
    const written = await held.ensure({
      mode: surface.mode.id,
      surface: surface.id,
      path: surface.entry,
      mime: mime.javascript,
      mount: `${bundler.directory}/${surface.entry}`,
      hash: compiled.integrity,
      integrity: `sha256-${compiled.integrity}`,
      bytes: compiled.bytes,
    });
    await this.em.flush();
    return written;
  }

  async generate(data, { bundler }) {
    const built = await bundler.bundle({ mime: data.mime, source: data.source, entry: data.entry });
    const [compiled] = built.entries;
    const stem = compiled.mount.slice(1);
    const kept = stem.replace(COMPILED, "");
    const files = [
      {
        path: `bundle/${kept}`,
        mime: data.mime,
        mount: `${bundler.directory}/bundle/${kept}`,
        hash: compiled.hash,
        integrity: `sha256-${await crypto.digest(data.source)}`,
        bytes: data.source.length,
      },
      { path: `bundle/${stem}`, mime: mime.javascript, mount: `${bundler.directory}/bundle/${stem}`, hash: compiled.integrity, integrity: `sha256-${compiled.integrity}`, bytes: compiled.bytes },
    ];
    const surface = await this.ensure({ mode: data.mode, slug: data.slug, mime: data.mime, traits: data.traits ?? ["FRAME"], entry: `bundle/${stem}` });
    await this.em.flush();
    const held = this.em.getRepository(FileEntity);
    for (const file of await held.find({ surface: surface.id })) if (!files.some((out) => out.path === file.path)) this.em.remove(file);
    for (const out of files) await held.ensure({ mode: data.mode, surface: surface.id, ...out });
    await this.em.flush();
    return surface;
  }
}

export class SurfaceEntity extends DataEntity {
  slug!: string;
  mime!: string;
  mount: (string | null) & Opt = null;
  entry!: string;
  sources: { path: string; bytes: number; mtime: string }[] & Opt = [];
  traits: string[] & Opt = [];
  trait: any & Opt = {};

  mode!: Rel<ModeEntity>;

  files = new Collection<FileEntity>(this);
  buffers = new Collection<BufferEntity>(this);
  [EntityRepositoryType]?: SurfaceRepository;
}

export const SurfaceSchema = new EntitySchema<SurfaceEntity, DataEntity>({
  class: SurfaceEntity,
  extends: DataSchema,
  name: "Surface",
  tableName: "Surface",
  repository: () => SurfaceRepository,
  uniques: [{ properties: ["mode", "slug", "mime"] }],
  filters: { mode: { cond: (args: any) => (args?.mode ? { mode: args.mode } : {}), default: true, args: false } },
  properties: {
    slug: { type: types.string },
    mime: { type: types.string },
    mount: { type: types.string, nullable: true },
    entry: { type: types.string },
    sources: { type: types.json, defaultRaw: `'[]'`, lazy: true, hidden: true },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      inversedBy: (mode) => mode.surfaces,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    files: { kind: "1:m", entity: () => FileEntity, mappedBy: (file) => file.surface },
    buffers: { kind: "m:n", entity: () => BufferEntity, mappedBy: (buffer) => buffer.surfaces },
  },
});

const twitch = new Vector().open("/before/datamap/migrate/2026.11.0", (ctx) =>
  ctx.migrate.renaming("View", "Surface"),
);

export default {
  type: "surface",
  schema: SurfaceSchema,
  entity: SurfaceEntity,
  repository: SurfaceRepository,
  twitch,
};
