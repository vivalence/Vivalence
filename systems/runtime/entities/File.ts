import { types, Collection, EntitySchema, EntityRepositoryType, type Opt, type Rel } from "@mikro-orm/core";
import { crypto } from "@vivalence/typology";

import { DataRepository, DataEntity, DataSchema } from "./index.ts";
import { ModeEntity } from "./index.ts";
import { BufferEntity } from "./index.ts";
import { ViewEntity } from "./index.ts";

const present = async (mount) => {
  try {
    await Deno.stat(mount);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
};

export class FileRepository extends DataRepository {
  unique(query) {
    return { mode: query.mode, path: query.path };
  }

  async record({ bytes, ...data }) {
    const hash = await crypto.digestBytes(bytes);
    const file = await this.ensure({ ...data, hash, integrity: `sha256-${hash}`, bytes: bytes.length });
    await this.em.flush();
    return file;
  }

  async rewrite(file, bytes) {
    const hash = await crypto.digestBytes(bytes);
    file.assign({ hash, integrity: `sha256-${hash}`, bytes: bytes.length });
    await this.em.flush();
    return file;
  }

  async sweep(now = () => new Date().toISOString()) {
    const report = { missing: [], returned: [] };
    for (const file of await this.find({})) {
      const mounted = await present(file.mount);
      if (mounted === !file.traits.includes("MISSING")) continue;
      if (mounted) {
        file.traits = file.traits.filter((name) => name !== "MISSING");
        const { MISSING, ...trait } = file.trait;
        file.trait = trait;
        report.returned.push(file.id);
      } else {
        file.traits = [...file.traits, "MISSING"];
        file.trait = { ...file.trait, MISSING: { since: now() } };
        report.missing.push(file.id);
      }
    }
    await this.em.flush();
    return report;
  }
}

export class FileEntity extends DataEntity {
  path!: string;
  mount!: string;
  mime!: string;
  hash!: string;
  integrity!: string;
  bytes: number & Opt = 0;
  traits: string[] & Opt = [];
  trait: any & Opt = {};

  mode!: Rel<ModeEntity>;
  view?: Rel<ViewEntity>;

  buffers = new Collection<BufferEntity>(this);
  [EntityRepositoryType]?: FileRepository;
}

export const FileSchema = new EntitySchema<FileEntity, DataEntity>({
  class: FileEntity,
  extends: DataSchema,
  name: "File",
  tableName: "File",
  repository: () => FileRepository,
  properties: {
    path: { type: types.string },
    mount: { type: types.string },
    mime: { type: types.string },
    hash: { type: types.string },
    integrity: { type: types.string },
    bytes: { type: types.integer, default: 0 },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    view: {
      kind: "m:1",
      entity: () => ViewEntity,
      fieldName: "view",
      inversedBy: (view) => view.files,
      nullable: true,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    buffers: { kind: "m:n", entity: () => BufferEntity, mappedBy: (buffer) => buffer.files },
  },
});

export default {
  type: "file",
  schema: FileSchema,
  entity: FileEntity,
  repository: FileRepository,
};
