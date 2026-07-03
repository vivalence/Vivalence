import { Mode } from "@vivalence/typology";

class Domain extends Mode { type = "domain"; }
class Ontology extends Mode { type = "ontology"; }
class Corpus extends Mode { type = "corpus"; }

export const traits = {};

// daemon-tier mode kinds, keyed by type.
// kind shape: { type, prototype, schema?, entity?, repository? }
export const kinds = {
  domain:   { type: "domain",   prototype: Domain },
  ontology: { type: "ontology", prototype: Ontology },
  corpus:   { type: "corpus",   prototype: Corpus },
};

// root fallback kind — base Mode. Used when a mode's type has no
// dedicated kind in either tier (daemon here, or domain). type comes from the module.
export const root = { prototype: Mode };
