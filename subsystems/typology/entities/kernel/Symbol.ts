import { Cascade, types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataSchema, DataEntity } from "../index.ts";
import { v7 } from "uuid";

import { ProductEntity, LiteralEntity } from "../index.ts";

export enum SymbolTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of literals into sets or categories
  AGENTIC = "AGENTIC", // used in context of agents and may evolve over time.
  // LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
  // COMPLETABLE = "COMPLETABLE", // contains a set of literals where each can be mastered
}

export class SymbolEntity extends DataEntity {
  traits: SymbolTraitsEnum[] & Opt = [];
  slug: string & Opt = "";
  name?: string;
  description?: string;

  data: any & Opt = {};
  ancestor?: Rel<SymbolEntity>;
  decendants = new Collection<SymbolEntity>(this);
  literals = new Collection<LiteralEntity>(this);
  products = new Collection<ProductEntity>(this);
}

export const SymbolSchema = new EntitySchema({
  // class: SymbolEntity,
  extends: DataSchema,
  abstract: true,
  name: "Symbol",
  tableName: "Symbol",
  uniques: [{ properties: ["slug"] }],
  properties: {
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },

    traits: {
      items: () => SymbolTraitsEnum,
      enum: true,
      array: true,
      default: [],
      type: types.json,
    },
    data: { type: types.json },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: (literal) => literal.symbols,
      cascade: [Cascade.REMOVE],
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
    products: {
      kind: "m:n",
      entity: () => ProductEntity,
      inversedBy: (product) => product.symbols,
    },
  },
});

export default {
  type: "symbol",
  traits: SymbolTraitsEnum,
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
