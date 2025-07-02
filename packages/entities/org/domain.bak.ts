// not wired
import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import {
  BaseModuleEntity,
  BaseModuleSchema,
} from "../0_root/BaseModuleEntity.ts";

export class DomainEntity extends BaseModuleEntity {
  // runtime!: Rel<RuntimeEntity>;
}

export const DomainSchema = new EntitySchema<DomainEntity, BaseModuleEntity>({
  class: DomainEntity,
  extends: BaseModuleSchema,
  tableName: "Domain",
  uniques: [{ properties: ["slug"] }],
  properties: {},
});
