import { EntitySchema, types, type Opt } from "@mikro-orm/core";
import { BaseSchema, BaseEntity } from "./BaseEntity.ts";

export class VirtualRepository extends Array {
  "#entity": any;
  public async add(entity: any) {
    super.push(entity);
  }
  public async create(data: any) {
    const entity = new this["#entity"](data);
    super.push(entity);
    return entity;
  }
  public delete(entity: any) {
    //
  }
}

export class VirtualEntity extends BaseEntity {
  // [EntityRepositoryType]?: VirtualRepository;
  slug: string & Opt = "";
  name?: string;
  description?: string;
}

export const VirtualSchema = new EntitySchema<VirtualEntity, BaseEntity>({
  class: VirtualEntity,
  extends: BaseSchema,
  name: "VirtualEntity",
  abstract: true,
  properties: {
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
  },
});
