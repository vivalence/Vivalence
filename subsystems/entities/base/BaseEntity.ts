import {
  types,
  EntitySchema,
  EntityRepositoryType,
  BaseEntity as MikroBaseEntity,
  EntityRepository as MikroBaseRepository,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { v7 } from "uuid";

export class BaseEntity extends MikroBaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
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
      lazy: true,
    },
    updatedAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
      lazy: true,
    },
  },
});
