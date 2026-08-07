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
  lighthouse = null;
  cargo = {};
  statics = {};
  status = new Status();
  modes = {};

  getAsset(asset) {
    if (!this.cargo || !asset) return null;
    if (asset.path) return this.cargo[asset.path] ?? null;
    if (asset.slug) {
      const entry = Object.entries(this.cargo).find(
        ([key]) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
      );
      return entry?.[1] ?? null;
    }
    return null;
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
