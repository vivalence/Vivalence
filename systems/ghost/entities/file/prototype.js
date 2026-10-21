import { Entity } from "@vivalence/typology";

export class File extends Entity {
  path = null;
  mime = null;
  hash = null;
  integrity = null;
  bytes = 0;
  traits = [];
  trait = {};
  mode = null;
  view = null;
  url = null;
}
