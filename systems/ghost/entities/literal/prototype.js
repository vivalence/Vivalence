import { Entity } from "@vivalence/typology";

export class Literal extends Entity {
  type = "literal";
  id = null;
  slug = null;
  daemon = null;
  symbol = null;
  ontology = null;
  traits = [];
  trait = {};
}
