import { Entity } from "@vivalence/typology";

export class Note extends Entity {
  type = "note";
  id = null;
  slug = null;
  user = null;
  daemon = null;
  mode = null;
  literal = null;
  buffer = null;
  turn = null;
  parent = null;
  traits = [];
  trait = {};
}
