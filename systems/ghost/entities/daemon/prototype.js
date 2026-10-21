import { atom } from "nanostores";
import { Entity } from "@vivalence/typology";

export class Daemon extends Entity {
  type = "daemon";
  id = null;
  slug = null;
  reference = null;
  manifest = null;
  statics = null;
  connection = null;
  aperture = null;
  call = null;
  cortex = null;
  runtime = null;
  $status = atom({ code: "IDLE" });

  get status() {
    return this.$status.get();
  }
  get modes() {
    return this.runtime.entities.mode.$entities.get().filter((mode) => mode.daemon === this);
  }

  toJSON() {
    return { id: this.id, slug: this.slug, reference: this.reference === null ? null : this.reference.absolute, manifest: this.manifest, status: this.status };
  }
}
