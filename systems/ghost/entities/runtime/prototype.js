import { atom } from "nanostores";

export class Runtime {
  type = "runtime";
  manifest = null;
  reference = null;
  remote = null;
  statics = null;
  multiplex = null;
  connection = null;
  aperture = null;
  call = null;
  cortex = null;
  lighthouse = null;
  entities = null;
  $status = atom({ code: "IDLE" });

  constructor(fields) {
    Object.assign(this, fields);
  }

  get status() {
    return this.$status.get();
  }
  get modes() {
    return this.entities.mode.$entities.get().filter((mode) => mode.daemon === null);
  }
  get attach() {
    return this.connection.branch("/attached");
  }

  get json() {
    return { manifest: this.manifest, reference: this.reference === null ? null : this.reference.absolute, remote: this.remote, status: this.status };
  }
}
