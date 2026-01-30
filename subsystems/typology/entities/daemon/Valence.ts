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
  GENERATIVE = "GENERATIVE", // creates product
  APPLICATIVE = "APPLICATIVE", // update product
}

export class ValenceRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug, mode: opt.mode };
  }
}

export class ValenceEntity extends DataEntity {
  slug: string & Opt = "";
  name?: string;
  description?: string;

  traits: ValenceTraitsEnum[] & Opt = [];
  docs?: string; //?
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

    data: { type: types.json, default: {} },

    docs: { nullable: true, type: types.string }, // todo: json

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
