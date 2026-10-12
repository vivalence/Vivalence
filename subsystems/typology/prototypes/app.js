import * as mime from "../schematics/scalars/mime.js";

const EXTENSION = { svelte: mime.dom.svelte, html: mime.dom.html };

const declared = (mount) => ({ mime: EXTENSION[String(mount).split(".").pop()], mount: String(mount) });

export class App {
  sources = [];
  schema = null;

  constructor(sources, schema = null) {
    if (sources instanceof App) return sources;
    this.sources = Array.isArray(sources) ? sources : [declared(sources)];
    this.schema = schema;
    const unnamed = this.sources.filter((source) => !source.mime || !(source.mount || source.source));
    if (!this.sources.length || unnamed.length) throw new Error(`App: every source names a mime and a mount or source: ${JSON.stringify(unnamed)}`);
  }

  fill(desc = {}) {
    desc.data ??= {};
    return (this.schema?.fill(desc) ?? desc).data;
  }
}

export const svelte = (strings, ...values) => ({
  mime: mime.dom.svelte,
  source: String.raw({ raw: strings }, ...values),
});
