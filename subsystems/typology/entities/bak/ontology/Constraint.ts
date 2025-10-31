import {
  types,
  Collection,
  EntitySchema,
  EntityRepository,
  EntityRepositoryType,
  type Opt,
  type Rel,
} from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { IssueEntity } from "./Issue.ts";

export enum ConstraintTraitsEnum {
  SCHEMATIC = "SCHEMATIC",
  RELATIONAL = "RELATIONAL",
  EXISTENTIAL = "EXISTENTIAL",
}

export class ConstraintRepository extends EntityRepository<ConstraintEntity> {
  async byTrait(trait: ConstraintTraitsEnum) {
    return this.find({ traits: { $like: `%"${trait}"%` } });
  }

  async byBranch(branch: string[]) {
    return this.find({ branch: branch });
  }
}

export class ConstraintEntity extends BaseEntity {
  [EntityRepositoryType]?: ConstraintRepository;

  slug!: string;
  name?: string & Opt;
  description?: string & Opt;

  traits: ConstraintTraitsEnum[] & Opt = [];
  branch: string[] & Opt = []; // [${entity} ${topology}] || [${topology} ${dimension}]

  constructor() {
    super();
  }

  // predicate: ((entity: any) => Promise<IssueEntity[]>) | null = null;

  async test(entity: any): Promise<IssueEntity[]> {
    if (!this.predicate) {
      return [];
    }

    const issues = (await this.predicate(entity)) || [];
    return issues.map((issue) =>
      new IssueEntity(issue).of(entity).violates(this),
    );
  }
}

export const ConstraintSchema = new EntitySchema<ConstraintEntity, BaseEntity>({
  class: ConstraintEntity,
  repository: () => ConstraintRepository,
  extends: BaseSchema,
  tableName: "Constraint",

  properties: {
    slug: {
      type: types.string,
      unique: true,
    },
    name: {
      type: types.string,
      nullable: true,
    },
    description: {
      type: types.string,
      nullable: true,
    },

    traits: {
      enum: true,
      array: true,
      items: () => ConstraintTraitsEnum,
      default: [],
      type: types.enum,
    },

    branch: {
      type: types.json,
      default: [],
    },

    // predicateData: {type: types.json, default: {},},
  },
});
// import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
// import { validators } from "@vivalence/shared";
// import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

// import { IssueEntity } from "./Issue.ts";
// import { UnitEntity } from "../corpus/Unit.ts";
// import { TagEntity } from "../corpus/Tag.ts";

// // function example(topography, runtime) {
// //   runtime.ontology.constraints.create({
// //     topology: topography.topology,
// //     branch: ["unit", topography.slug],
// //     traits: ["RELATIONAL"],
// //     predicate: async (unit) => {
// //       if (!(unit instanceof runtime.domain.data.entities.unit))
// //         throw new Error("predicate applies to other than entity type unit");

// //       if (!unit.tags.isInitialized()) await unit.tags.init();
// //       const relations = unit.tags.map((tag) => tag.data.ONTOLOGICAL);

// //       const issues = [];
// //       for (const relation of topography.relations) {
// //         validators.viva
// //           .relations(relation, relations) //
// //           .map((issue) => {
// //             issue.path = ["unit", "tags"];
// //             issue.context.unit = unit;
// //             issues.push(issue);
// //           });
// //       }
// //       return issues;
// //     },
// //   });
// // }

// export enum ConstraintTraitsEnum {
//   SCHEMATIC = "schematic",
//   RELATIONAL = "relational",
//   EXISTENTIAL = "existential",
// }

// export class ConstraintRepository extends BaseDataRepository {
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

// export class ConstraintEntity extends BaseDataEntity {
//   traits: ConstraintTraitsEnum[] & Opt = [];
//   // topology: string & Opt = "";
//   branch: string[] & Opt; // [${entity} ${togography}] || [${topology} ${dimension}]
//   predicate: (entity: any) => Promise<IssueEntity[]>;

//   constructor(rule) {
//     super();

//     if (rule.data) throw new Error("Constraint data is legacy");

//     // this.topology = rule.topology;
//     this.traits = rule.traits;
//     this.branch = rule.branch;
//     this.predicate = rule.predicate;

//     if (this.traits.length < 1)
//       throw new Error("ConstraintEntity requires property trait");
//     if (!this.predicate || typeof this.predicate !== "function")
//       throw new Error("ConstraintEntity requires predicate function");
//   }

//   async test(entity: UnitEntity | TagEntity | any) {
//     const issues = (await this.predicate(entity)) || [];
//     return issues.map((issue) =>
//       new IssueEntity(issue).of(entity).violates(this),
//     );
//   }
//   // async assert(entity: UnitEntity | TagEntity) {const issues = []; let entityType = ""; if (entity instanceof UnitEntity) entityType = "unit"; else if (entity instanceof TagEntity) entityType = "tag"; console.log("constraint assert entitytype", this.entity, entityType); if (this.traits.includes("EXISTENTIAL")) {const fails = await this.data.EXISTENTIAL(entity); for (const issue of fails) {issues.push(issue);}} if (this.traits.includes("SCHEMATIC")) {const fails = await validators.viva.entity(this.data.SCHEMATIC, entity); for (const issue of fails) {issues.push(issue);}} if (this.traits.includes("RELATIONAL")) {if (entity instanceof UnitEntity) {if (!entity.tags.isInitialized()) await entity.tags.init(); const relations = []; entity.tags .map((tag) => tag.data.ONTOLOGICAL) .map((r) => relations.push(r)); const fails = await validators.viva.relations(this.data.RELATIONAL, relations,); for (const issue of fails) {issue.path = ["tags"]; issues.push(issue);}}} return issues .forEach((issue) => {issue.context[this.entity] = entity; issue.path.unshift(this.entity); return issue;}) .map((issue) => new IssueEntity(issue).violates(this).of(entity));}
//   // get entity() {return this.branch[0];}
// }
