// ## LEARNABLE (Tag-centric)
// ### LEARNABLE INDIVIDUAL
// - Focuses on a single tag's memory
// - Scope: One specific tag' memory
// - returns a single tag's memory

// ### LEARNABLE RELATIONAL
// - Covers all tag-to-units relation memories from a specific tag
// - Scope: One tag and all its relations to units
// - returns an aggregation of the tag<>unit memories

// ## COMPLETABLE (Unit-centric)
// ### COMPLETABLE INDIVIDUAL
// - Focuses on all the tag related unit's direct memories
// - Scope: the single memory of all related units.
// - returns a list of the related units direct memories

// ### COMPLETABLE RELATIONAL
// - Covers all related units' relations to any tag
// - Scope: from tag related units, all its relations to any tags.
// - returns a list of the related units unit<>tags memory aggregation

// its like an expanding star.
// individual focusses on the units and tag directly.
// relational focusses on the space between units and tags.
// learnable focusses on the tag.
// completable on the the set of units.

// schema.condition = {
//   $id: "dependency.condition",
//   type: "object",
//   properties: {
//     solver: {
//       type: "object",
//       description: "defines what subject and condition resolvers to use.",
//       properties: {
//         subject: {
//           type: "string",
//           enum: ["TAG[COMPLETABLE]", "TAG[LEARNABLE]", "TAG[DEPENDENCY]", "UNIT"],
//         },
//         condition: { type: "string", enum: ["LOGIC"] },
//       },
//     },
//     subject: {
//       type: "object",
//       description:
//         "The subject of the condition. identified by slug. resolved via subject resolver.",
//       properties: {
//         slug: { type: "string" },
//       },
//     },
//     condition: {
//       type: "object",
//       description:
//         "A logic statement, applied to the result of the subject resolver. resolves to a boolean.",
//     },
//   },
// };
// schema.tactic = {
//   $id: "tactic.patch.provisioning",
//   type: "object",
//   properties: {
//     slug: { type: "string" },
//     relations: {
//       type: "object",
//     },
//     masks: {
//       type: "object",
//     },
//   },
// };
// schema.tag = {
//   type: "object",
//   title: "Tag",
//   description: "",
//   properties: {
//     traits: {
//       type: "array",
//       description: "the traits implemented by the tag",
//       enum: ["ONTOLOGICAL", "LEARNABLE", "COMPLETABLE", "DEPENDENCY", "STRUCTURAL"],
//     },
//     slug: {
//       type: "string",
//       description:
//         "the tags's slug. functions as a unique identifier for the tags across runtimes.",
//     },
//     data: {
//       type: "object",
//       properties: {
//         COMPLETABLE: {
//           type: "object",
//           properties: {
//             updatedAt: { type: "string" },
//             UNTOUCHED: { type: "integer" },
//             UNKNOWN: { type: "integer" },
//             LEARNING: { type: "integer" },
//             KNOWN: { type: "integer" },
//             GRADUATED: { type: "integer" },
//           },
//         },
//         LEARNABLE: {
//           type: "object",
//           properties: {
//             flavor: { type: "string", enum: ["INDIVIDUAL", "RELATIONAL"] },
//             type: { type: "string", enum: ["BAYESIAN", "BOOLEAN"] },
//           },
//         },
//         DEPENDENCY: {
//           type: "object",
//           properties: {
//             preconditions: {
//               type: "array",
//               items: {
//                 $ref: "dependency.condition",
//               },
//             },
//             conditions: {
//               type: "array",
//               items: {
//                 $ref: "dependency.condition",
//               },
//             },
//             tactic: {
//               type: "object",
//               $ref: "tactic.patch.provisioning",
//             },
//           },
//         },
//         STRUCTURAL: {},
//         ONTOLOGICAL: {
//           type: "object",
//           properties: {
//             branch: { type: "string" },
//             leaf: { type: "string", optional: true },
//           },
//         },
//       },
//     },
//   },
//   required: ["slug", "data", "traits"],
//   additionalProperties: true,
// };

// schema.signal = {
//     enum: STRING?
//     ratio: {
// 	success: INT,
// 	total: INT
//     }?
// }

// ok. extendable.
// whats the enum?

// MASTERY +10
// SUCCESS  +1
// NEUTRAL   0
// MISTAKE  -1
// FAILURE -10
