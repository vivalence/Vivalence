import {
  types,
  EntityRepositoryType,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataRepository, DataEntity, DataSchema } from "@vivalence/entities";
import { ModuleEntity } from "./Module.ts";

export class ValenceRepository extends DataRepository {
  unique(opt) {
    return {
      slug: opt.slug,
      module: opt.module,
    };
  }
}

export class ValenceEntity extends DataEntity {
  docs!: string; //?
  resolve!: Record<string, any> & Opt = {}; // {generator:Path}
  module: Rel<ModuleEntity>;
  // signature
  [EntityRepositoryType]?: ValenceRepository;
}

export const ValenceSchema = new EntitySchema({
  class: ValenceEntity,
  extends: DataSchema,
  tableName: "Valence",
  repository: () => ValenceRepository,
  uniques: [{ properties: ["slug", "module"] }],
  properties: {
    docs: { type: types.string },
    resolve: { type: types.json, defaultRaw: `"{}"` },

    module: {
      kind: "m:1",
      eager: true,
      nullable: true,
      entity: () => ModuleEntity,
      fieldName: "module",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
  },
});

export default {
  schema: ValenceSchema,
  entity: ValenceEntity,
};
