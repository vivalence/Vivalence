import { Entity } from "@vivalence/typology";

export class Symbol extends Entity {
  type = "symbol";
  id = null;
  slug = null;
  daemon = null;
  mode = null;
  literals = [];
  traits = [];
  trait = {};
}
