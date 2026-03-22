import { types, EntityRepositoryType, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";

export enum IntentTypeEnum {
  SELFEVIDENT = "SELFEVIDENT",
  APPLICATIVE = "APPLICATIVE",
}

export enum IntentTraitsEnum {
  FURNISHED = "FURNISHED",
  FEEDING = "FEEDING",
}

export class IntentRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug, mode: opt.mode };
  }
}

export class IntentEntity extends DataEntity {
  slug: string & Opt = "";
  type: IntentTypeEnum & Opt = IntentTypeEnum.SELFEVIDENT;
  traits: IntentTraitsEnum[] & Opt = [];
  name?: string;
  description?: string;
  trait: any & Opt = {};

  mode!: Rel<ModeEntity>;
  [EntityRepositoryType]?: IntentRepository;
}

export const IntentSchema = new EntitySchema({
  class: IntentEntity,
  extends: DataSchema,
  tableName: "Intent",
  repository: () => IntentRepository,
  uniques: [{ properties: ["slug", "mode"] }],
  properties: {
    slug: { type: types.string },
    type: {
      enum: true,
      items: () => IntentTypeEnum,
      defaultRaw: `'${IntentTypeEnum.SELFEVIDENT}'`,
    },
    traits: {
      items: () => IntentTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
    },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    trait: { type: types.json, defaultRaw: `'{}'` },

    mode: {
      kind: "m:1",
      eager: true,
      entity: () => ModeEntity,
      fieldName: "mode",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

  },
});

export default {
  type: "intent",
  schema: IntentSchema,
  entity: IntentEntity,
  repository: IntentRepository,
};
