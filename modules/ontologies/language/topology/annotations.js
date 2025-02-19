import { RuleEntity, AnnotationEntity } from "@vivalence/schema";
import annotations from "./annotations/index.js";

export default function load(ontology) {
  // i might have to compute the tree here.
  // first step, pull topological node.
  // per child of topological, fetch node from file.
  // write to rules.
  // hmm. not yet. all this should change is that i dont have to call pos pos. which is ... fine for now.

  Object.values(topology).map(({ node }) => {
    ontology.annotations.add(new AnnotationEntity(node));
    // ontology.rules.add(new RuleEntity({traits: ["SCHEMATIC"], // nests pos inside itself. which i think is technically correct. path: [node.slug], data: {SCHEMATIC: {json: {type: "string", // from CATEGORICAL trait title: node.name, description: node.description, enum: node.data.ANCESTOR.map(({ slug }) => slug),},},},}),);
  });

  return ontology;
}
