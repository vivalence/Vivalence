import { atom } from "nanostores";
import { Entity } from "@vivalence/typology";

export class Daemon extends Entity {
  type = "daemon";
  id = null;
  slug = null;
  reference = null;
  manifest = null;
  metadata = { manifest: null, statics: null, aperture: null };
  entities = null;
  connection = null;
  aperture = null;
  call = null;
  cortex = null;
  $status = atom({ code: "IDLE" });
  $files = null;

  get status() {
    return this.$status.get();
  }
  get modes() {
    return this.entities.mode.$entities.get().filter((mode) => mode.daemon === this);
  }
  get files() {
    return this.$files.get();
  }

  toJSON() {
    return { id: this.id, slug: this.slug, reference: this.reference === null ? null : this.reference.absolute, manifest: this.manifest, status: this.status };
  }
}
