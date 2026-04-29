import { Mode } from "@vivalence/typology";

class Domain extends Mode {
  type = "domain";
}

class Ontology extends Mode {
  type = "ontology";
}

class Corpus extends Mode {
  type = "corpus";
}

export const traits = {};

export const modes = [
  { type: "domain", prototype: Domain },
  { type: "ontology", prototype: Ontology },
  { type: "corpus", prototype: Corpus },
];
