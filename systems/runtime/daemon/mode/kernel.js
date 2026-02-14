import { Mode } from "@vivalence/typology";

class Domain extends Mode {
  type = "domain";
}

class Ontology extends Mode {
  type = "ontology";
}

class Topology extends Mode {
  type = "topology";
}

export const traits = {};

export const modes = [
  { type: "domain", prototype: Domain },
  { type: "ontology", prototype: Ontology },
  { type: "topology", prototype: Topology },
];
