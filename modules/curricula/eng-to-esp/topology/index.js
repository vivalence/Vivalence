import topographies from "./topographies/index.js";

// alternative future syntax.
// export default {topographies:[], rules:[], annotations:[],remedies:[], classifier:{}}

export default (ontology) => {
  const topology = "eng2esp";

  Object.values(topographies).map(({ relations, ...topography }) => {
    // TODO: pull annotation entities into TopographyEntity.annotations;

    if (relations) {
      for (const relation of relations) {
        ontology.constraints.create({
          branch: ["unit", topography.slug],
          traits: ["RELATIONAL"],
          data: { RELATIONAL: relation },
          topology,
        });
      }
    }

    delete topography.constraints;
    topography.topology = topology;

    ontology.topographies.create(topography);
  });

  return ontology;
};
