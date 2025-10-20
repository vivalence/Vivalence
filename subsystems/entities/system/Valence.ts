import {
  types,
  EntityRepositoryType,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataRepository, DataEntity, DataSchema } from "@vivalence/entities";
import { ModeEntity } from "@vivalence/entities";

export class ValenceRepository extends DataRepository {
  unique(opt) {
    return {
      slug: opt.slug,
      mode: opt.mode,
    };
  }
}

export class ValenceEntity extends DataEntity {
  docs!: string; //?
  resolve!: Record<string, any> & Opt = {}; // {generator:Path}
  mode: Rel<ModeEntity>;
  // signature
  [EntityRepositoryType]?: ValenceRepository;
}

export const ValenceSchema = new EntitySchema({
  class: ValenceEntity,
  extends: DataSchema,
  tableName: "Valence",
  repository: () => ValenceRepository,
  uniques: [{ properties: ["slug", "mode"] }],
  properties: {
    docs: { type: types.string },
    resolve: { type: types.json, defaultRaw: `"{}"` },

    mode: {
      kind: "m:1",
      eager: true,
      nullable: true,
      entity: () => ModeEntity,
      fieldName: "mode",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
  },
});

export default {
  type: "valence",
  schema: ValenceSchema,
  entity: ValenceEntity,
};
