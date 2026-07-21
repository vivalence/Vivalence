import { Path } from "./path.js";
import { Bundle } from "./bundle.js";

export class View {
  kind = null;
  hash = null;
  mount = null;
  bundle = null;

  constructor(record = {}, bundle = null, kind = null) {
    if (record instanceof View) return record;
    if (typeof record === "string" || record instanceof Path) record = { mount: record };
    this.mount = new Path(record.mount);
    this.bundle = new Bundle(bundle ?? record.bundle);
    this.hash = record.hash ?? null;
    this.kind = kind ?? record.kind ?? this.mount.absolute.split(".").pop();
  }

  withUrl(url) {
    this.bundle.withUrl(url);
    return this;
  }

  load() {
    return this.bundle.load(this.mount.nature);
  }

  get json() {
    return {
      kind: this.kind,
      ...(this.hash && { hash: this.hash }),
      mount: this.mount.nature,
      bundle: this.bundle.json,
    };
  }

  toJSON() {
    return this.json;
  }
}
