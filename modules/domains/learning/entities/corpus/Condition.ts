import {
  Collection,
  EntitySchema,
  EntityRepositoryType,
  EntityRepository,
} from "@mikro-orm/core";
import { type Opt, type Rel, type EventArgs } from "@mikro-orm/core";

import { BaseDataEntity, BaseDataSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";

// import { CorpusEntity } from "../2_module/Corpus.ts";
import { DependencyEntity } from "../corpus/Dependency.ts";

import { hash } from "@vivalence/shared";

export class ConditionRepository extends EntityRepository<ConditionEntity> {
  public async expect(data: any) {
    const em = this.getEntityManager();
    if (data.id) return await em.findOne(this.entityName, data.id);
    if (!data.slug) data.slug = hash.array([data.scope, data.assertion]);
    const entity = await em.findOne(this.entityName, { slug: data.slug });
    if (entity) return entity;
    return em.create(this.entityName, data);
  }
}

export class ConditionEntity extends BaseDataEntity {
  [EntityRepositoryType]?: ConditionRepository;

  user?: Rel<UserEntity>;
  // corpus?: Rel<CorpusEntity>;

  isConditionTo = new Collection<DependencyEntity>(this);
  isPreconditionTo = new Collection<DependencyEntity>(this);

  scope: any & Opt = {};
  assertion: any & Opt = {};
  met: boolean & Opt = false;
}

export const ConditionSchema = new EntitySchema<
  ConditionEntity,
  BaseDataEntity
>({
  class: ConditionEntity,
  repository: () => ConditionRepository,
  extends: BaseDataSchema,
  tableName: "Condition",

  hooks: {
    beforeCreate: [
      (args: EventArgs<ConditionEntity>) => {
        if (!args.entity.slug)
          args.entity.slug = hash.array([
            args.entity.scope,
            args.entity.assertion,
          ]);
      },
    ],
  },
  uniques: [{ properties: ["slug", "user"] }],
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    // corpus: {kind: "m:1", entity: () => CorpusEntity, fieldName: "corpus", updateRule: "cascade", deleteRule: "set null", nullable: true,},
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
  },
});
