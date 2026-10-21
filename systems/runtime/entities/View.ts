import { types, Collection, EntitySchema, EntityRepositoryType, type Opt, type Rel } from "@mikro-orm/core";
import { crypto, mime } from "@vivalence/typology";

import { DataRepository, DataEntity, DataSchema } from "./index.ts";
import { ModeEntity } from "./index.ts";
import { FileEntity } from "./index.ts";
import { BufferEntity } from "./index.ts";

const COMPILED = /\.mjs$/;

export class ViewRepository extends DataRepository {
  unique(query) {
    return { mode: query.mode, slug: query.slug, mime: query.mime };
  }

  async bundle(data, { bundler }) {
    const built = await bundler.bundle({ mime: data.mime, source: data.source, entry: data.entry });
    const [compiled] = built.entries;
    const stem = compiled.mount.slice(1);
    const kept = stem.replace(COMPILED, "");
    const files = [
      ...(data.source === undefined ? [] : [{
        path: `bundle/${kept}`,
        mime: data.mime,
        mount: `${bundler.directory}/bundle/${kept}`,
        hash: compiled.hash,
        integrity: `sha256-${await crypto.digest(data.source)}`,
        bytes: data.source.length,
      }]),
      { path: `bundle/${stem}`, mime: mime.javascript, mount: `${bundler.directory}/bundle/${stem}`, hash: compiled.integrity, integrity: `sha256-${compiled.integrity}`, bytes: compiled.bytes },
    ];
    const view = await this.ensure({ mode: data.mode, slug: data.slug, mime: data.mime, traits: data.traits ?? ["FRAME"], entry: `bundle/${stem}` });
    await this.em.flush();
    const held = this.em.getRepository(FileEntity);
    for (const file of await held.find({ view: view.id })) if (!files.some((out) => out.path === file.path)) this.em.remove(file);
    for (const out of files) await held.ensure({ mode: data.mode, view: view.id, ...out });
    await this.em.flush();
    return view;
  }
}

export class ViewEntity extends DataEntity {
  slug!: string;
  mime!: string;
  entry!: string;
  traits: string[] & Opt = [];
  trait: any & Opt = {};

  mode!: Rel<ModeEntity>;

  files = new Collection<FileEntity>(this);
  buffers = new Collection<BufferEntity>(this);
  [EntityRepositoryType]?: ViewRepository;
}

export const ViewSchema = new EntitySchema<ViewEntity, DataEntity>({
  class: ViewEntity,
  extends: DataSchema,
  name: "View",
  tableName: "View",
  repository: () => ViewRepository,
  uniques: [{ properties: ["mode", "slug", "mime"] }],
  properties: {
    slug: { type: types.string },
    mime: { type: types.string },
    entry: { type: types.string },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      inversedBy: (mode) => mode.views,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    files: { kind: "1:m", entity: () => FileEntity, mappedBy: (file) => file.view },
    buffers: { kind: "m:n", entity: () => BufferEntity, mappedBy: (buffer) => buffer.views },
  },
});

export default {
  type: "view",
  schema: ViewSchema,
  entity: ViewEntity,
  repository: ViewRepository,
};
