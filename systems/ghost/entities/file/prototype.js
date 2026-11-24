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
  daemon = null;
  surface = null;
  $url = null;

  get url() {
    return this.$url.get();
  }

  toJSON() {
    const { $url, ...base } = super.toJSON();
    return base;
  }
}
