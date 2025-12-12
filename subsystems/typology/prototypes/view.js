import { is, Url, Path } from "@vivalence/typology";
// import { is } from "@vivalence/shared";
// import { Path } from "./index.js";

export class View {
  bundles = [];
  constructor(path, opts = { greedy: true }) {
    if (path instanceof View) return path; //patch ops
    this.path = new Path(path);
    if (opts.url) this.withUrl(opts.url);
    if (opts.bundler) this.withBundler(opts.bundler);
    if (this.bundler && opts.greedy) (async () => await this.bundle())();
  }
  withUrl(url) {
    this.url = new URL(url.href + this.path.value);
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
    if (!this.bundler) throw new Error("view missing bundler");
    if (!this.bundles[0]) this.bundles = await this.bundler(this.path.absolute);
    return this;
  }

  serve(branch) {
    const path = this.path.ancestor.branch(branch);
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
