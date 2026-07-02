import subjects from "./subjects/index.js";

// const topology = "eng2lat";

// subjects.forEach((entity) => {
//   // entity.topology = topology;
//   return entity;
// });

// const constraints = [];
// subjects.forEach(({ relations = [], ...subject }) => {
//   for (const relation of relations) {
//     constraints.push({
//       branch: ["unit", subject.slug],
//       traits: ["RELATIONAL"],
//       data: { RELATIONAL: relation },
//       topology,
//     });
//   }
//   return subject;
// });

export default { subjects };
