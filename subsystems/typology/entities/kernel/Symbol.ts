import {
  types,
  Collection,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { DataSchema, DataEntity } from "../index.ts";
import { v7 } from "uuid";

import { LiteralEntity } from "../index.ts";

export enum SymbolTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of literals into sets or categories
  LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
  COMPLETABLE = "COMPLETABLE", // contains a set of literals where each can be mastered
  AGENTIC = "AGENTIC", // used in context of agents and may evolve over time.
}

export class SymbolEntity extends DataEntity {
  // traits: SymbolTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  ancestor?: Rel<SymbolEntity>;
  decendants = new Collection<SymbolEntity>(this);
  literals = new Collection<LiteralEntity>(this);
}

export const SymbolSchema = new EntitySchema({
  // class: SymbolEntity,
  extends: DataSchema,
  abstract: true,
  name: "Symbol",
  tableName: "Symbol",
  uniques: [{ properties: ["slug"] }],
  properties: {
    // id: { type: types.string, primary: true, onCreate: () => v7() }, slug: { type: types.string }, name: { type: types.string, nullable: true }, description: { type: types.string, nullable: true }, traits: {type: types.json, enum: true, array: true, items: () => [], default: [],}, createdAt: {type: types.datetime, onCreate: () => new Date(), defaultRaw: `CURRENT_TIMESTAMP`, lazy: true,}, updatedAt: {type: types.datetime, onCreate: () => new Date(), onUpdate: () => new Date(), defaultRaw: `CURRENT_TIMESTAMP`, lazy: true,},
    // traits: {
    //   type: types.json,
    //   defaultRaw: `"[]"`,
    //   items: () => SymbolTraitsEnum,
    // },
    data: { type: types.json },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: (literal) => literal.symbols,
    },
    ancestor: {
      kind: "m:1",
      entity: () => SymbolEntity,
      inversedBy: (symbol) => symbol.decendants,
      nullable: true,
    },
    decendants: {
      kind: "1:m",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.ancestor,
    },
  },
});

export default {
  type: "symbol",
  schema: SymbolSchema,
  entity: SymbolEntity,
  // repository: TopographyRepository,
};

// // really more of a domain thing.
// export default {
//   type: "object",
//   title: "symbol",
//   description: "",
//   properties: {
//     slug: {
//       type: "string",
//       description:
//         "functions as a unique identifier for the symbol across runtimes.",
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
//       description: "the schema of a symbols's data.",
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
// //   title: "symbol",
// //   description: "",
// //   properties: {
// //     slug: {
// //       type: "string",
// //       description: "functions as a unique identifier for the symbol across runtimes.",
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
// //       description: "the schema of a symbols's data.",
// //       // depends on the traits properties: {}, required: [],
// //     },
// //   },
// //   required: ["slug", "data", "traits"],
// // }
