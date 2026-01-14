import subject from "./subjects/index.js";
import schema from "./schema.json" with { type: "json" };

// const constraints = [];
// // to be moved into domain.
// topographies.forEach((topography) => {
//   topography.relations = topography.relations || [];

//   for (const relation of topography.relations) {
//     constraints.push({
//       branch: ["unit", topography.slug],
//       traits: ["RELATIONAL"],
//       data: { RELATIONAL: relation },
//       topology,
//     });
//   }
//   return topography;
// });

export default { subject, entities: { subject } };
