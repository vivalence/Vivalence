import { is, Url, Path } from "@vivalence/typology";

export class View {
  bundles = [];
  mask = {};
  constructor(mount, mask = {}) {
    if (mount instanceof View) return mount;
    if (typeof mount === "object" && !(mount instanceof View)) {
      mask = mount.mask ?? {};
      mount = mount.mount;
    }
    this.mask = mask;
    this.path = new Path(mount);
  }
  cast(desc = {}) {
    if (!desc.data) desc.data = {};
    this.mask.cast(desc);
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
    if (is.empty(this.bundles)) this.bundling = this.bundle();
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
