import { RuleEntity, AnnotationEntity } from "@vivalence/schema";
import annotations from "./annotations/index.js";
import entities from "./entities/index.js";

export default function load(ontology) {
  const topology = "ud";
  Object.entries(entities).map(([type, entity]) => {
    // not sure about entities in topology.
    ontology.rules.add(
      new RuleEntity({
        branch: [type],
        traits: ["SCHEMATIC"],
        data: { json: entity },
        topology,
      }),
    );
  });
  Object.values(annotations).map(({ node }) => {
    node.topology = topology;
    ontology.annotations.add(new AnnotationEntity(node));
  });

  return ontology;
}
