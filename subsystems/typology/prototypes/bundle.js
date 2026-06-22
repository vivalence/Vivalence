import { is } from "@vivalence/typology";

// The compiled-view lifecycle, shared across the daemon↔client seam. ONE artifact, two
// faces driven by different runtimes (the Wafer shape): the daemon COMPILES + SERVES the
// entry; the client LOADS + MOUNTS the served module. The heavy esbuild compiler is never
// imported here — it arrives as an injected `bundler` (server) — so this prototype stays
// client-safe (the kajuit face is a dynamic import + a svelte mount, zero build deps).
export class Bundle {
  entry = null; // Path — the .svelte source the bundler compiles
  url = null; // Url — where the compiled module is served
  outputs = []; // esbuild outputFiles — server, runtime-only
  bundler = null; // injected compiler — server
  module = null; // loaded ES module — client
  instance = null; // mounted svelte instance — client

  // ── daemon face ──
  withBundler(bundler) {
    this.bundler = bundler;
    if (is.empty(this.outputs)) this.bundling = this.compile();
    return this;
  }

  async compile() {
    if (!this.bundler) throw new Error("bundle missing bundler");
    this.outputs = await this.bundler(this.entry.absolute);
    return this;
  }

  serve(branch) {
    const path = this.entry.trace.branch(branch);
    const output = this.outputs.find((output) => output.path === path.absolute);
    return {
      text: output.text,
      response: { type: "application/javascript", body: output.text },
    };
  }

  get bundled() {
    return !!this.outputs[0];
  }

  flush() {
    this.outputs = [];
    return this;
  }

  // ── kajuit face ──
  async load() {
    this.module ??= await import(this.url.absolute);
    return this.module.default; // (target, props) => { instance, destroy }
  }

  async mount(target, props) {
    this.instance = (await this.load())(target, props);
    return this.instance;
  }

  unmount() {
    this.instance?.destroy();
    this.instance = null;
  }
}
