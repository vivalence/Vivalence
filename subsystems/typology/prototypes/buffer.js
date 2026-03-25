import { Value, is, Url, Path } from "@vivalence/typology";

export class BufferView {
  bundles = [];
  schema = {};
  constructor(mount, schema = {}) {
    if (mount instanceof BufferView) return mount;
    if (typeof mount === "object" && !(mount instanceof BufferView)) {
      schema = mount.schema ?? {};
      mount = mount.mount;
    }
    this.schema = schema;
    this.path = new Path(mount);
  }
  cast(desc = {}) {
    if (!desc.data) desc.data = {};
    Value.Default(this.schema, desc);
    return desc.data;
  }
  withPath(path) {
    this.path = path;
    return this;
  }
  withUrl(url) {
    this.url = url;
    return this;
  }
  withBundler(bundler) {
    this.bundler = bundler;
    if (is.empty(this.bundles)) (async () => await this.bundle())();
    return this;
  }
  flush() {
    this.bundles = [];
    return this;
  }
  async bundle() {
    if (!this.bundler) throw new Error("buffer view missing bundler");
    this.bundles = await this.bundler(this.path.absolute);
    // if (!this.bundles[0])
    return this;
  }

  serve(branch) {
    const path = this.path.trace.branch(branch);
    const bundle = this.bundles.find((bundle) => bundle.path === path.absolute);
    return {
      text: bundle.text,
      response: {
        type: "application/javascript",
        body: bundle.text,
      },
    };
  }
  get bundled() {
    return !!this.bundles[0];
  }
}

// export class View {
//   bundles = [];
//   constructor(path, opts = { greedy: true }) {
//     if (path instanceof View) return path; //patch ops
//     this.path = new Path(path);
//     if (opts.url) this.withUrl(opts.url);
//     if (opts.bundler) this.withBundler(opts.bundler);
//     if (this.bundler && opts.greedy) (async () => await this.bundle())();
//   }
//   withPath(path) { this.path = path; return this; }
//   withUrl(url) { this.url = url; return this; }
//   withBundler(bundler) {
//     this.bundler = bundler;
//     if (is.empty(this.bundles)) (async () => await this.bundle())();
//     return this;
//   }
//   flush() { this.bundles = []; return this; }
//   async bundle() {
//     if (!this.bundler) throw new Error("view missing bundler");
//     this.bundles = await this.bundler(this.path.absolute);
//     return this;
//   }
//   serve(branch) {
//     const path = this.path.trace.branch(branch);
//     const bundle = this.bundles.find((bundle) => bundle.path === path.absolute);
//     return { text: bundle.text, response: { type: "application/javascript", body: bundle.text } };
//   }
//   get bundled() { return !!this.bundles[0]; }
// }
