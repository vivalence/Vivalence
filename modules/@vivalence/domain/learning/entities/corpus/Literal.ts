import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataEntity, DataSchema } from "@vivalence/entities";

import { SymbolEntity } from "../corpus/Symbol.ts";
import { ExerciseEntity } from "../userland/Exercise.ts";
import { PlayEntity } from "../userland/Play.ts";
import { MemoryEntity } from "../userland/Memory.ts";

export class LiteralEntity extends DataEntity {
  symbols = new Collection<SymbolEntity>(this);

  memories = new Collection<MemoryEntity>(this);
  plays = new Collection<PlayEntity>(this);

  annotation: any & Opt = {};
  data: any & Opt = {};
}

export const LiteralSchema = new EntitySchema<LiteralEntity, DataEntity>({
  extends: DataSchema,
  class: LiteralEntity,
  tableName: "Literal",
  uniques: [{ properties: ["slug"] }],
  properties: {
    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.literal,
    },
    exercises: {
      kind: "m:n",
      entity: () => ExerciseEntity,
      mappedBy: (exercise) => exercise.literals,
    },
    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.literal,
    },
    symbols: { kind: "m:n", entity: () => SymbolEntity, mappedBy: "literals" },

    annotation: { type: "json" },
    data: { type: "json" },
  },
});

export default {
  schema: LiteralSchema,
  entity: LiteralEntity,
  // gestalt: gestalt,
  // repository: TopographyRepository,
};

// const gestalt = {
//   type: "object",
//   title: "Literal",
//   description:
//     "A prototypical Literal schema. this schema is used as a template for all literals. These are the implementation independent properties of this domain's literals.",
//   properties: {
//     slug: {
//       type: "string",
//       description:
//         "the literal's slug. functions as a unique identifier for the literal across runtimes.",
//     },
//     data: {
//       type: "object",
//       description: "the schema of a literal's data.",
//       properties: {
//         known: {
//           type: "string",
//           description: "the translation in the known language",
//         },
//         learning: {
//           type: "string",
//           description: "the word by itself, in the language to be learned",
//         },
//         index: {
//           type: ["integer", "null"],
//           description:
//             "the literal's index in the spanish vocabulary frequency dictionary. lower is more frequent. range: 1-5000",
//         },
//         example: {
//           type: ["object", "null"],
//           description:
//             "a simple example of how the word is used in a sentence in both languages.",
//           properties: {
//             learning: {
//               type: ["string", "null"],
//               description:
//                 "a very simple example of how the word is used in the language to be learned in the form of a full sentence",
//             },
//             known: {
//               type: ["string", "null"],
//               description:
//                 "a very simple example of how the word is used in the known language in the form of the translated full sentence",
//             },
//           },
//           additionalProperties: false,
//           required: ["known", "learning"],
//         },
//       },
//       required: ["known", "learning", "index", "example"],
//       additionalProperties: false,
//     },
//     annotation: {
//       type: "object",
//       description: "literal annoatition schema",
//       properties: {
//         // computationall populated at ontology.boot
//       },
//       required: [],
//       additionalProperties: false,
//       allOf: [],
//     },
//   },
//   required: ["slug", "data", "annotation"],
//   additionalProperties: true,
// };
// allOf: Object.values(PoS).map((pos) => {const statement = {if: {properties: {pos: { const: pos.schema.properties.annotation.properties.pos.enum }}}, then: {required: pos.schema.properties.annotation.required}}; if (pos.schema.properties.annotation.allOf) {statement.then.allOf = pos.schema.properties.annotation.allOf;} return statement;})

// really maybe more of a domain thing.
// actually kind of mixed.
// patches or applies domain defaults.
// in this case, patches.

// export default (schema) => {
// should be classes.
// schema.entities.literal.annotation={class,schema}
// schema.entities.literal.data={class,schema}
// but how do i define the literal, with the embeddable not yet defined?
// i cant. at least for now.
// i define the schema once in the beginnign of the mikro clients lifecycle, the daemon owns the client, no play.

// // schema.entities.literal = {
// // type: "object", title: "Literal", description: "A prototypical Literal schema. this schema is used as a template for all literals. These are the implementation independent properties of this domain's literals.", properties: {
// // slug: {type: "string", description: "the literal's slug. functions as a unique identifier for the literal across runtimes.",},
// data: {
//   // type: "object", description: "the schema of a literal's data.",
//   // properties: {
//   known: { type: "string", description: "the translation in the known language" },
//   learning: {
//     type: "string",
//     description: "the word by itself, in the language to be learned",
//   },
//   index: {
//     type: ["integer", "null"],
//     description:
//       "the literal's index in the spanish vocabulary frequency dictionary. lower is more frequent. range: 1-5000",
//   },
//   example: {
//     type: ["object", "null"],
//     description: "a simple example of how the word is used in a sentence in both languages.",
//     properties: {
//       learning: {
//         type: ["string", "null"],
//         description:
//           "a very simple example of how the word is used in the language to be learned in the form of a full sentence",
//       },
//       known: {
//         type: ["string", "null"],
//         description:
//           "a very simple example of how the word is used in the known language in the form of the translated full sentence",
//       },
//     },
//     // additionalProperties: false, required: ["known", "learning"],
//     // },
//   },
//   // required: ["known", "learning", "index", "example"], additionalProperties: false,
// },
// annotation: {
//   type: "object",
//   description: "literal.annoatition schema",
//   properties: {
//     ...schema.annotations,
//   },
//   // required: ["pos", "lemma"], additionalProperties: false,
// },
// },
// required: ["slug", "data", "annotation"],
// additionalProperties: false,
// return schema;
// };
// schema.entities.symbol.data[...symbol.TRAITS[]]
