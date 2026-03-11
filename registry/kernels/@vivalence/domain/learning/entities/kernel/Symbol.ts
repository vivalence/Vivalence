import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { maps } from "@vivalence/typology/entities";

// import { PlayEntity } from "../userspace/Play.ts";
// import { MemoryEntity } from "../userspace/Memory.ts";

// export enum SymbolTraitsEnum {}
// LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
// COMPLETABLE = "COMPLETABLE", // contains a set of literals where each can be mastered

export class SymbolEntity extends maps.kernel.symbol.entity {
  // traits: SymbolTraitsEnum[] & Opt = [];
  // plays = new Collection<PlayEntity>(this);
  // memories = new Collection<MemoryEntity>(this);
}

export const SymbolSchema = new EntitySchema({
  class: SymbolEntity,
  extends: maps.kernel.symbol.schema,
  tableName: "Symbol",
  name: "Symbol",
  properties: {
    // traits: {items: () => SymbolTraitsEnum, enum: true, array: true, default: [], type: types.json,},
    // plays: {kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.symbol,},
    // memories: {kind: "1:m", entity: () => MemoryEntity, mappedBy: (memory) => memory.symbol,},
  },
});

export default {
  type: "symbol",
  // traits: SymbolTraitsEnum,
  schema: SymbolSchema,
  entity: SymbolEntity,
  repository: maps.kernel.symbol.repository,
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
