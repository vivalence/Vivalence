import topographies from "./topographies/index.js";

// const topology = "eng2lat";

// topographies.forEach((entity) => {
//   // entity.topology = topology;
//   return entity;
// });

// const constraints = [];
// topographies.forEach(({ relations = [], ...topography }) => {
//   for (const relation of relations) {
//     constraints.push({
//       branch: ["unit", topography.slug],
//       traits: ["RELATIONAL"],
//       data: { RELATIONAL: relation },
//       topology,
//     });
//   }
//   return topography;
// });

export default { topographies };
