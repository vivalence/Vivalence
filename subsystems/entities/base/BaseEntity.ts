import {
  types,
  EntitySchema,
  EntityRepositoryType,
  BaseEntity as MikroBaseEntity,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { v7 } from "uuid";

export class BaseEntity extends MikroBaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  // slug type traits
}

export const BaseSchema = new EntitySchema<BaseEntity>({
  class: BaseEntity,
  name: "BaseEntity",
  abstract: true,
  properties: {
    id: {
      type: types.string,
      primary: true,
      onCreate: () => v7(),
    },
    createdAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
      lazy: true,
    },
    updatedAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
      lazy: true,
    },
  },
});
