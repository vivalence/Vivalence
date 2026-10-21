import { EntityRepositoryType, Cascade, types, Collection, EntitySchema } from "@mikro-orm/core";
import { type Opt, type Rel } from "@mikro-orm/core";
import { DataRepository, DataSchema, DataEntity } from "./index.ts";

import { LiteralEntity } from "./index.ts";
import { ModeEntity } from "./index.ts";
import { DaemonEntity } from "./index.ts";

export class SymbolRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }
}

export class SymbolEntity extends DataEntity {
  traits: string[] & Opt = [];
  slug: string & Opt = "";

  trait: any & Opt = {};

  literals = new Collection<LiteralEntity>(this);
  daemon!: Rel<DaemonEntity>;
  mode!: Rel<ModeEntity>;

  [EntityRepositoryType]?: SymbolRepository;
  // ancestor?: Rel<SymbolEntity>;
  // decendants = new Collection<SymbolEntity>(this);
}

export const SymbolSchema = new EntitySchema({
  class: SymbolEntity,
  extends: DataSchema,
  name: "Symbol",
  tableName: "Symbol",
  uniques: [{ properties: ["daemon", "slug"] }],
  repository: () => SymbolRepository,
  filters: { daemon: { cond: (args: any) => ({ daemon: args.daemon }), default: false } },
  properties: {
    slug: { type: types.string },
    // name: { type: types.string, nullable: true },
    // description: { type: types.string, nullable: true },

    traits: { type: types.json, defaultRaw: `'[]'` },

    trait: { type: types.json },
    daemon: { kind: "m:1", entity: () => DaemonEntity, inversedBy: (daemon) => daemon.symbols, updateRule: "cascade", deleteRule: "cascade" },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: (literal) => literal.symbols,
      pivotTable: "symbol_literals",
      joinColumns: ["symbol_entity_id"],
      inverseJoinColumns: ["literal_entity_id"],
      cascade: [Cascade.REMOVE],
    },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      inversedBy: (mode) => mode.symbols,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    // ancestor: {kind: "m:1", entity: () => SymbolEntity, inversedBy: (symbol) => symbol.decendants, nullable: true,}, decendants: {kind: "1:m", entity: () => SymbolEntity, mappedBy: (symbol) => symbol.ancestor,},
  },
});

export default {
  type: "symbol",
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
