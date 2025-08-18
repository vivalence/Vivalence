import { types, EntitySchema, type Opt } from "@mikro-orm/core";
import { BaseSchema, BaseEntity } from "./BaseEntity.ts";

export class DataEntity extends BaseEntity {
  slug: string & Opt = "";
  name?: string;
  description?: string;
}

export const DataSchema = new EntitySchema<DataEntity, BaseEntity>({
  class: DataEntity,
  extends: BaseSchema,
  name: "DataEntity",
  abstract: true,
  properties: {
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
  },
});
