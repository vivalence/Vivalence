import { types, EntityRepositoryType, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { ModeEntity } from "../index.ts";

// TODO activate

export enum IntentTraitsEnum {
  LABELED = "LABELED",
  MASKED = "MASKED",
  AIMED = "AIMED",
  QUEUEING = "QUEUEING",
}

export class IntentRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug, mode: opt.mode, user: opt.user };
  } // not needed
}

export class IntentEntity extends DataEntity {
  // user
  user!: Rel<UserEntity>;
  mode!: Rel<ModeEntity>;
  slug: string & Opt = "";

  traits: IntentTraitsEnum[] & Opt = [];
  trait: any & Opt = {};

  [EntityRepositoryType]?: IntentRepository;
}

export const IntentSchema = new EntitySchema({
  class: IntentEntity,
  extends: DataSchema,
  tableName: "Intent",
  repository: () => IntentRepository,
  uniques: [{ properties: ["user", "slug", "mode"] }],
  properties: {
    slug: { type: types.string },
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    traits: {
      items: () => IntentTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
    },
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
