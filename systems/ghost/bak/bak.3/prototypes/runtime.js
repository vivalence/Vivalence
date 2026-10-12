import { atom } from "nanostores";

export class Runtime {
  type = "runtime";
  slug = null;
  manifest = null;
  reference = null;
  remote = null;
  connection = null;
  lighthouse = null;
  entities = null;
  daemon = null;
  services = {};
  $status = atom({ code: "IDLE" });

  constructor(fields) {
    Object.assign(this, fields);
  }

  get status() {
    return this.$status.get();
  }
  get daemons() {
    return this.entities === null ? [] : this.entities.daemon.$entities.get();
  }

  get json() {
    return { manifest: this.manifest, reference: this.reference === null ? null : this.reference.absolute, remote: this.remote, status: this.status, daemons: this.daemons.map((daemon) => daemon.toJSON()) };
  }
}
