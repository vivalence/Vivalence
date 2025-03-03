import annotations from "./annotations/index.js";
import entities from "./entities/index.js";
import remedies from "./remedies/index.ts";
import computeSchematics from "./computeSchematics.js";

function topology(ontology) {
  const topology = "ud";
  Object.entries(entities).map(([type, entity]) => {
    ontology.constraints.create({
      branch: [type],
      traits: ["SCHEMATIC"],
      data: { SCHEMATIC: entity },
      topology,
    });
  });

  Object.values(annotations).map(({ node }) => {
    node.topology = topology;
    ontology.annotations.create(node);
  });

  remedies.map((r) => ontology.remedy.register(r));

  return ontology;
}

topology.computeSchematics = computeSchematics;

export default topology;
