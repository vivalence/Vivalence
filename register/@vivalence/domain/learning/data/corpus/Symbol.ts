import {
  types,
  Collection,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataEntity, DataSchema } from "@vivalence/entities";

import { UnitEntity } from "../corpus/Unit.ts";
import { ExerciseEntity } from "../userland/Exercise.ts";
import { PlayEntity } from "../userland/Play.ts";
import { MemoryEntity } from "../userland/Memory.ts";

export enum SymbolTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of units into sets or categories
  LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
  COMPLETABLE = "COMPLETABLE", // contains a set of units where each can be mastered
  AGENTIC = "AGENTIC", // used in context of agents and may evolve over time.
}

export class SymbolEntity extends DataEntity {
  traits: SymbolTraitsEnum[] & Opt = [];
  data: any & Opt = {};

  ancestor?: Rel<SymbolEntity>;
  decendants = new Collection<SymbolEntity>(this);
  units = new Collection<UnitEntity>(this);

  plays = new Collection<PlayEntity>(this);
  memories = new Collection<MemoryEntity>(this);
}

export const SymbolSchema = new EntitySchema<SymbolEntity, DataEntity>({
  class: SymbolEntity,
  extends: DataSchema,
  tableName: "Symbol",
  uniques: [{ properties: ["slug"] }],
  properties: {
    traits: {
      type: types.enum,
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => SymbolTraitsEnum,
      default: [],
    },
    data: { type: types.json },

    units: {
      kind: "m:n",
      entity: () => UnitEntity,
      inversedBy: "symbols",
      pivotTable: "_SymbolToUnit",
    },
    ancestor: {
      kind: "m:1",
      entity: () => SymbolEntity,
      fieldName: "ancestor",
      inversedBy: "decendants",
      nullable: true,
    },
    decendants: {
      kind: "1:m",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.ancestor,
    },
    exercises: {
      kind: "m:n",
      entity: () => ExerciseEntity,
      mappedBy: (exercise) => exercise.symbols,
    },
    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.symbol,
    },
    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.symbol,
    },
  },
});

export default {
  schema: SymbolSchema,
  entity: SymbolEntity,
  // repository: TopographyRepository,
};

// // really more of a domain thing.
// export default {
//   type: "object",
//   title: "tag",
//   description: "",
//   properties: {
//     slug: {
//       type: "string",
//       description:
//         "functions as a unique identifier for the tag across runtimes.",
//     },
//     traits: {
//       // enum ONTOLOGICAL STRUCTURAL LEARNABLE COMPLETABLE
//       type: "array",
//       items: {
//         type: "string",
//         enum: ["ONTOLOGICAL", "STRUCTURAL", "LEARNABLE", "COMPLETABLE"],
//       },
//     },
//     data: {
//       type: "object",
//       description: "the schema of a tags's data.",
//       // depends on the traits properties: {}, required: [],
//       additionalProperties: true,
//     },
//   },
//   required: ["slug", "data", "traits"],
//   additionalProperties: true,
// };

// // return schema;
// // };
// // {
// //   type: "object",
// //   title: "tag",
// //   description: "",
// //   properties: {
// //     slug: {
// //       type: "string",
// //       description: "functions as a unique identifier for the tag across runtimes.",
// //     },
// //     traits: {
// //       // enum ONTOLOGICAL STRUCTURAL LEARNABLE COMPLETABLE
// //       type: "array",
// //       items: {
// //         type: "string",
// //         enum: ["ONTOLOGICAL", "STRUCTURAL", "LEARNABLE", "COMPLETABLE"],
// //       },
// //     },
// //     data: {
// //       type: "object",
// //       description: "the schema of a tags's data.",
// //       // depends on the traits properties: {}, required: [],
// //     },
// //   },
// //   required: ["slug", "data", "traits"],
// // }
