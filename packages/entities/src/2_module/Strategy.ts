import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import {
  BaseModuleEntity,
  BaseModuleSchema,
} from "../0_root/BaseModuleEntity.ts";

// import { UserEntity } from "../1_repo/User.ts";
// import { RuntimeEntity } from "../1_repo/Runtime.ts";

export enum StrategyTraitsEnum {
  AGENTIC = "AGENTIC",
  _ = "_",
}

export class StrategyEntity extends BaseModuleEntity {
  // user!: Rel<UserEntity>;
  // runtime!: Rel<RuntimeEntity>;
  traits?: StrategyTraitsEnum[];
  data: any & Opt = "{}";
}

export const StrategySchema = new EntitySchema<
  StrategyEntity,
  BaseModuleEntity
>({
  class: StrategyEntity,
  extends: BaseModuleSchema,
  tableName: "Strategy",
  uniques: [{ properties: ["slug"] }],
  // uniques: [{name: "Strategy_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Strategy_slug_runtime_key" ON public."Strategy" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  properties: {
    // user: {kind: "m:1", entity: () => UserEntity, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",},
    traits: {
      columnType: "JSONB",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => StrategyTraitsEnum,
    },
    data: { type: "json" },
  },
});
