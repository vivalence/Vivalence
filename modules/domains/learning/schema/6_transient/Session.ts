// UNCONNCECTED
import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataSchema } from "@vivalence/schema";
import { UserEntity, RuntimeEntity } from "@vivalence/schema";

export enum SessionTraitsEnum {
  AGENTIC = "AGENTIC",
}

export class SessionEntity extends BaseDataEntity {
  user!: Rel<UserEntity>;
  runtime!: Rel<RuntimeEntity>;
  traits: SessionTraitsEnum[] & Opt = [];
  itinerary: any & Opt = "{}";
}

export const SessionSchema = new EntitySchema<SessionEntity, BaseDataEntity>({
  class: SessionEntity,
  extends: BaseDataSchema,
  tableName: "Session",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      columnType: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => SessionTraitsEnum,
      default: [],
    },

    itinerary: { type: "json" },
  },
});
