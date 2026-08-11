import { BaseEntity as MikroBaseEntity } from "@mikro-orm/core";
import { type Opt } from "@mikro-orm/core";

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

export class VirtualEntity extends MikroBaseEntity {
  slug: string & Opt = "";
  name?: string;
  description?: string;
}
