import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { validators } from "@vivalence/shared";
import { VirtualEntity, VirtualRepository } from "../base/VirtualEntity.ts";

// function example(topography, runtime) {
//   runtime.ontology.constraints.create({
//     topology: topography.topology,
//     branch: ["unit", topography.slug],
//     traits: ["RELATIONAL"],
//     predicate: async (unit) => {
//       if (!(unit instanceof runtime.domain.data.entities.unit))
//         throw new Error("predicate applies to other than entity type unit");

//       if (!unit.tags.isInitialized()) await unit.tags.init();
//       const relations = unit.tags.map((tag) => tag.data.ONTOLOGICAL);

//       const issues = [];
//       for (const relation of topography.relations) {
//         validators.viva
//           .relations(relation, relations) //
//           .map((issue) => {
//             issue.path = ["unit", "tags"];
//             issue.context.unit = unit;
//             issues.push(issue);
//           });
//       }
//       return issues;
//     },
//   });
// }

export enum ConstraintTraitsEnum {
  SCHEMATIC = "schematic",
  RELATIONAL = "relational",
  EXISTENTIAL = "existential",
}

export class ConstraintRepository extends VirtualRepository {
  constructor(data: any) {
    super();
    this["#entity"] = ConstraintEntity;
  }
  byTrait(trait) {
    return this.filter((constraint) => constraint.traits.includes(trait));
  }
  byBranch(branch) {
    return this.filter((c) => c.branch.join() === branch.join());
  }
}

export class ConstraintEntity extends VirtualEntity {
  traits: ConstraintTraitsEnum[] & Opt = [];
  branch: string[] & Opt; // [${entity} ${togography}] || [${topology} ${dimension}]
  predicate: (entity: any) => Promise<IssueEntity[]>;

  constructor(rule) {
    super();

    if (rule.data) throw new Error("Constraint data is legacy");

    this.traits = rule.traits;
    this.branch = rule.branch;
    this.predicate = rule.predicate;

    if (this.traits.length < 1)
      throw new Error("ConstraintEntity requires property trait");
    if (!this.predicate || typeof this.predicate !== "function")
      throw new Error("ConstraintEntity requires predicate function");
  }

  async test(entity: any) {
    const issues = (await this.predicate(entity)) || [];
    return issues.map((issue) =>
      new IssueEntity(issue).of(entity).violates(this),
    );
  }
  // get entity() {return this.branch[0];}
}

export default {
  // schema: DimensionSchema
  entity: ConstraintEntity,
  repository: ConstraintRepository,
};
