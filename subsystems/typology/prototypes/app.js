import { Path } from "./path.js";

export class App {
  mount = null;
  schema = null;

  constructor(mount, schema = null) {
    if (mount instanceof App) return mount;
    if (typeof mount === "object" && !(mount instanceof Path)) {
      schema = mount.schema ?? schema;
      mount = mount.mount;
    }
    this.schema = schema;
    this.mount = new Path(mount);
  }

  fill(desc = {}) {
    desc.data ??= {};
    this.schema?.fill(desc);
    return desc.data;
  }
}
