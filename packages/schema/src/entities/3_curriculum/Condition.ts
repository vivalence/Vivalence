import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";

// AnyEntity,
import { Collection, EntitySchema, EntityRepositoryType, EntityRepository } from "@mikro-orm/core";
import { type Opt, type Rel, type EventArgs } from "@mikro-orm/core";

import { BaseCurriculumEntity, BaseCurriculumSchema } from "../0_root/BaseCurriculumEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
import { DependencyEntity } from "../3_curriculum/Dependency.ts";
// import { User } from "../0_root/User.ts";

function hash(arr: any[]) {
  const message = JSON.stringify(arr.sort());
  const messageBuffer = new TextEncoder().encode(message);
  const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer);
  const hash = encodeHex(hashBuffer);
  return hash;
}

export class ConditionRepository extends EntityRepository<ConditionEntity> {
  public async expect(data: any) {
    const em = this.getEntityManager();
    if (data.id) return await em.findOne(this.entityName, data.id);
    if (!data.slug) data.slug = hash([data.scope, data.assertion]);
    const entity = await em.findOne(this.entityName, { slug: data.slug, runtime: data.runtime });
    if (entity) return entity;
    return em.create(this.entityName, data);
  }
}

export class ConditionEntity extends BaseCurriculumEntity {
  [EntityRepositoryType]?: ConditionRepository;

  runtime!: Rel<RuntimeEntity>;
  curriculum?: Rel<CurriculumEntity>;
  scope: any & Opt = "{}";
  assertion: any & Opt = "{}";
  met: boolean & Opt = false;

  isConditionTo = new Collection<DependencyEntity>(this);
  isPreconditionTo = new Collection<DependencyEntity>(this);

  // get slugHash() {return hash([this.scope, this.assertion]);}
  // slugHash: {default: `""`, lazy: true, persist: true, type: "method", getter: true, getterName: "slugHash",},
  // user!: Rel<User>;
}

export const ConditionSchema = new EntitySchema<ConditionEntity, BaseCurriculumEntity>({
  class: ConditionEntity,
  repository: () => ConditionRepository,
  extends: BaseCurriculumSchema,
  tableName: "Condition",

  hooks: {
    beforeCreate: [
      (args: EventArgs<ConditionEntity>) => {
        if (!args.entity.slug) args.entity.slug = hash([args.entity.scope, args.entity.assertion]);
      },
    ],
  },
  uniques: [
    // FUTURE: must include user
    { properties: ["slug", "runtime"] },
    { properties: ["runtime", "assertion", "scope"] },
  ],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    curriculum: {
      kind: "m:1",
      entity: () => CurriculumEntity,
      fieldName: "curriculum",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
    },
    scope: { type: "json" },
    assertion: { type: "json" },
    met: { type: "boolean" },
    isConditionTo: {
      kind: "m:n",
      entity: () => DependencyEntity,
      mappedBy: "conditions",
    },
    isPreconditionTo: {
      kind: "m:n",
      entity: () => DependencyEntity,
      mappedBy: "preconditions",
    },
    // user: {kind: "m:1", entity: () => UserEntity, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
  },
});
