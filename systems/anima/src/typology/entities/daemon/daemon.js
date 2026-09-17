import { Entity } from "../../prototypes/entity.js";
import { Status } from "@vivalence/typology";

export class Daemon extends Entity {
  id = null;
  slug = null;
  url = null;
  manifest = null;
  mount = null;
  connection = null;
  entities = null;
  mounting = null;
  lighthouse = null;
  cargo = null;
  statics = {};
  status = new Status();
  modes = {};

  getAsset(asset) {
    return this.cargo?.resolve(asset) ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      url: this.url,
      mount: this.mount?.nature ?? null,
      manifest: this.manifest,
    };
  }
}
