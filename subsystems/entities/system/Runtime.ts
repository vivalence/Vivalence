import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "@vivalence/entities";

export class RuntimeEntity extends BaseEntity {
  url!: string;
  slug!: string;
}

export const RuntimeSchema = new EntitySchema({
  class: RuntimeEntity,
  extends: BaseSchema,
  tableName: "Runtime",
  properties: {
    slug: { type: types.string, unique: true },
    url: { type: types.string },
  },
});

export default {
  schema: RuntimeSchema,
  entity: RuntimeEntity,
  // repository: RuntimeRepository,
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
