import {
  types,
  EntityRepositoryType,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";

export enum ValenceTraitsEnum {
  DESTINATION = "DESTINATION",
}
export class ValenceRepository extends DataRepository {
  unique(opt) {
    return {
      slug: opt.slug,
      mode: opt.mode,
    };
  }
}

export class ValenceEntity extends DataEntity {
  slug: string & Opt = "";
  name?: string;
  description?: string;

  traits: ValenceTraitsEnum[] & Opt = [];
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
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },

    traits: {
      enum: true,
      array: true,
      items: () => ValenceTraitsEnum,
      default: [],
    },

    docs: { type: types.string },
    resolve: { type: types.json, defaultRaw: `"{}"` },
    data: { type: types.json, default: {} },

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
