import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";

// TODO
export class DaemonEntity extends BaseEntity {
  // id!: string;
  //   users
  //   runtimes
  //   services
  //   data
  //   config
}

export const DaemonSchema = new EntitySchema<DaemonEntity, BaseEntity>({
  class: DaemonEntity,
  extends: BaseSchema,
  tableName: "Daemon",
  // properties: {},
});
