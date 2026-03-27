import { EntityRepositoryType, Cascade, types, Collection, EntitySchema } from "@mikro-orm/core";
import { type Opt, type Rel } from "@mikro-orm/core";
import { DataRepository, DataSchema, DataEntity } from "../index.ts";

import { LiteralEntity } from "../index.ts";

export enum SymbolTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of literals into sets or categories
  LABELED = "LABELED", // for name and description
}

export class SymbolRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }
}

export class SymbolEntity extends DataEntity {
  traits: SymbolTraitsEnum[] & Opt = [];
  slug: string & Opt = "";

  trait: any & Opt = {};

  literals = new Collection<LiteralEntity>(this);

  [EntityRepositoryType]?: SymbolRepository;
  // ancestor?: Rel<SymbolEntity>;
  // decendants = new Collection<SymbolEntity>(this);
}

export const SymbolSchema = new EntitySchema({
  // class: SymbolEntity,
  extends: DataSchema,
  abstract: true,
  name: "Symbol",
  tableName: "Symbol",
  uniques: [{ properties: ["slug"] }],
  repository: () => SymbolRepository,
  properties: {
    slug: { type: types.string },
    // name: { type: types.string, nullable: true },
    // description: { type: types.string, nullable: true },

    traits: {
      items: () => SymbolTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },

    trait: { type: types.json },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: (literal) => literal.symbols,
      cascade: [Cascade.REMOVE],
    },

    // ancestor: {kind: "m:1", entity: () => SymbolEntity, inversedBy: (symbol) => symbol.decendants, nullable: true,}, decendants: {kind: "1:m", entity: () => SymbolEntity, mappedBy: (symbol) => symbol.ancestor,},
  },
});

export default {
  type: "symbol",
  traits: SymbolTraitsEnum,
  schema: SymbolSchema,
  entity: SymbolEntity,
  repository: SymbolRepository,
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
