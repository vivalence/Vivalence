import { Path } from "./path.js";

export class App {
  mount = null;
  source = null;
  schema = null;

  constructor(mount, schema = null) {
    if (mount instanceof App) return mount;
    if (typeof mount === "object" && !(mount instanceof Path)) {
      schema = mount.schema ?? schema;
      this.source = mount.source ?? null;
      mount = mount.mount;
    }
    this.schema = schema;
    this.mount = mount ? new Path(mount) : null;
    if (!this.mount && !this.source) throw new Error("App: mount or source required");
  }

  fill(desc = {}) {
    desc.data ??= {};
    this.schema?.fill(desc);
    return desc.data;
  }
}

export const svelte = (strings, ...values) => ({
  source: String.raw({ raw: strings }, ...values),
});
