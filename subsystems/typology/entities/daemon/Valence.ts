import { types, EntityRepositoryType, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";

export enum ValenceTypeEnum {
  DESTINATION = "destination",
  PROVIDER = "provider", // CREATES PRODUCT
}

export class ValenceRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug, mode: opt.mode };
  }
}

export class ValenceEntity extends DataEntity {
  slug: string & Opt = "";
  type: ValenceTypeEnum & Opt = ValenceTypeEnum.DESTINATION;
  name?: string;
  description?: string;

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
    type: {
      enum: true,
      items: () => ValenceTypeEnum,
      default: ValenceTypeEnum.DESTINATION,
    },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },

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
