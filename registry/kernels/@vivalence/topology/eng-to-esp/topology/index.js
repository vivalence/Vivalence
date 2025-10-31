import topographies from "./topographies/index.js";

const topology = "eng2esp";

topographies.forEach((entity) => {
  entity.topology = topology;
  return entity;
});

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

export default { topographies };
