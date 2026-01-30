import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { validators } from "@vivalence/shared";
import { VirtualEntity, VirtualRepository, IssueEntity } from "../index.ts";

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
    //     const key = branch.join(":");
    //     return this.filter((c) => c.branch.join(":") === key);
  }
  matching(branch, traits = []) {
    const branches = [branch];
    if (branch.length > 1) branches.push([branch[0]]);

    return this.filter((c) => {
      const branchMatch = branches.some(
        (b) => c.branch.join(":") === b.join(":"),
      );
      if (!branchMatch) return false;
      const traitMatch =
        traits.length === 0 ||
        traits.some((t) => c.traits.includes(t.toUpperCase()));
      return branchMatch && traitMatch;
    });
  }
}

export class ConstraintEntity extends VirtualEntity {
  traits: ConstraintTraitsEnum[] & Opt = [];
  branch: string[] & Opt; // [${entity} ${togography}] || [${topology} ${dimension}]
  predicate: (entity: any) => Promise<IssueEntity[]>;

  constructor({ branch, traits, predicate, description }) {
    super();
    this.branch = branch;
    this.traits = traits.map((t) => t.toUpperCase());
    this.predicate = predicate;
    this.description = description || "";
    if (!this.predicate || typeof this.predicate !== "function") {
      throw new Error("ConstraintEntity requires predicate function");
    }
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
// class ConstraintEntity {
//   async test(entity) {
//     try {
//       const issues = (await this.predicate(entity)) || [];
//       return issues.map((issue) => ({ ...issue, constraint: this, entity }));
//     } catch (error) {
//       return [
//         {
//           message: `Constraint error: ${error.message}`,
//           violation: "error",
//           path: this.branch,
//           context: { error, entity },
//           constraint: this,
//         },
//       ];
//     }
//   }
// }
