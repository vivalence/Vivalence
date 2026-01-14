import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../index.ts";

export class DaemonEntity extends BaseEntity {
  url!: string;
  slug!: string;
}

export const DaemonSchema = new EntitySchema({
  class: DaemonEntity,
  extends: BaseSchema,
  name: "Daemon",
  tableName: "Daemon",
  properties: {
    slug: { type: types.string, unique: true },
    url: { type: types.string },
  },
});

export default {
  type: "daemon",
  schema: DaemonSchema,
  entity: DaemonEntity,
  // repository: DaemonRepository,
};

// export class VirtualRepository extends Array {
//   "#entity": any;
//   public async add(entity: any) {
//     super.push(entity);
//   }
//   public async create(data: any) {
//     const entity = new this["#entity"](data);
//     super.push(entity);
//     return entity;
//   }
//   public delete(entity: any) {
//     //
//   }
// }
// export class ConstraintRepository extends VirtualRepository {
//   constructor(data: any) {
//     super();
//     this["#entity"] = ConstraintEntity;
//   }
//   byTrait(trait) {
//     return this.filter((constraint) => constraint.traits.includes(trait));
//   }
//   byBranch(branch) {
//     return this.filter((c) => c.branch.join() === branch.join());
//   }
// }
