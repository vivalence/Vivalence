import {
  types,
  Collection,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { DimensionEntity } from "./Dimension.ts";
import { ConstraintEntity } from "./Constraint.ts";

export class TopographyEntity extends BaseEntity {
  slug!: string;
  name?: string & Opt;
  description?: string & Opt;

  dimensions = new Collection<DimensionEntity>(this);
  constraints = new Collection<ConstraintEntity>(this);

  constructor() {
    super();
  }
}

export const TopographySchema = new EntitySchema<TopographyEntity, BaseEntity>({
  class: TopographyEntity,
  extends: BaseSchema,
  tableName: "Topography",

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

    dimensions: {
      kind: "1:m",
      entity: () => DimensionEntity,
      mappedBy: (dimension) => dimension.topography,
    },

    constraints: {
      kind: "1:m",
      entity: () => ConstraintEntity,
      mappedBy: (constraint) => constraint.topography,
    },
  },
});

// import { EntityRepositoryType, EntityRepository } from "@mikro-orm/core";
// import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
// import { BaseDataEntity, BaseDataRepository } from "@vivalence/entities";

// export class TopographyEntity extends BaseDataEntity {
//   // slug, name, descr from DataEntity
//   // topology: string & Opt = "";
//   dimensions: any & Opt = [];
//   constraints: any & Opt = [];
//   // [any]: any;

//   constructor(node = {}) {
//     super();
//     Object.assign(this, node);
//     // @beef i think i could start to remove the relations as a required input and start to compute some defaults if none given.
//   }
// }

// export class TopographyRepository extends BaseDataRepository {
//   constructor(data: any) {
//     super();
//     this["#entity"] = TopographyEntity;
//   }
//   findOne(query) {
//     return this.find((topography) => {
//       return (
//         Object.entries(query).filter(
//           ([key, value]) => topography[key] === value,
//         ).length > 0
//       );
//     });
//   }
// }

// // const example = {
// //   slug: "verb",
// //   name: "Verb",
// //   description:
// //     "A word expressing actions, states, or processes. Latin verbs show complex inflection for person, number, tense, mood, voice, and aspect.",
// //   dimensions: [
// //     { branch: ["pos"], required: true },
// //     { branch: ["lemma"], required: true },
// //     { branch: ["verbform"], required: true }, // Finite vs. infinitive vs. participle
// //     { branch: ["voice"], required: true }, // Active/passive distinction always relevant
// //     { branch: ["aspect"], required: false }, // Imperfective/perfective/prospective
// //     { branch: ["tense"], required: false }, // Only for finite forms
// //     { branch: ["mood"], required: false }, // Only for finite forms
// //     { branch: ["person"], required: false }, // Only for finite forms
// //     { branch: ["number"], required: false }, // Only for finite forms
// //     { branch: ["inflclass"], required: false }, // Conjugation pattern (1st, 2nd, 3rd, 4th)
// //   ],
// //   constraints: [
// //     { unique: { branch: "pos" } },
// //     { required: { branch: "pos", leaf: "verb" } },
// //     { required: { branch: "verbform" } },
// //     { required: { branch: "voice" } }, // Voice is always grammatically relevant
// //     // Conditional requirements: finite verbs need full inflectional marking
// //     {
// //       condition: {
// //         if: { required: { branch: "verbform", leaf: "fin" } },
// //         then: [
// //           { required: { branch: "tense" } },
// //           { required: { branch: "mood" } },
// //           { required: { branch: "person" } },
// //           { required: { branch: "number" } },
// //         ],
// //       },
// //     },
// //   ],
// // };
