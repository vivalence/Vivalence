import { Entity } from "@vivalence/typology";

export class View extends Entity {
  slug = null;
  mime = null;
  entry = null;
  traits = [];
  trait = {};
  mode = null;
  files = [];
}
