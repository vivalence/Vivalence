import { digest } from "../gestalten/belt/crypto.js";

const verified = new Map();

export class Bundle {
  url = null;
  entries = [];

  constructor(record = {}) {
    if (record instanceof Bundle) return record;
    this.entries = record.entries ?? [];
    this.url = record.url ?? null;
  }

  static merge(...bundles) {
    const entries = new Map();
    for (const bundle of bundles) for (const entry of new Bundle(bundle).entries) entries.set(entry.mime, entry);
    return new Bundle({ entries: [...entries.values()] });
  }

  withUrl(url) {
    this.url = url;
    return this;
  }

  entry(type) {
    return this.entries.find((candidate) => candidate.mime === type);
  }

  negotiate(accept) {
    return accept.map((type) => this.entry(type)).find(Boolean) ?? null;
  }

  async load(accept) {
    const entry = this.negotiate(accept);
    if (!entry) throw new Error(`bundle offers none of ${accept.join(" · ")}: ${this.entries.map((held) => held.mime).join(" · ")}`);
    if (verified.has(entry.integrity)) return verified.get(entry.integrity);
    const response = await fetch(this.url + entry.mount);
    if (!response.ok) throw new Error(`bundle fetch ${response.status}`);
    const text = await response.text();
    const digested = await digest(text);
    if (digested !== entry.integrity)
      throw new Error(`integrity sha256 ${digested.slice(0, 12)} is not ${entry.integrity.slice(0, 12)}`);
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    try {
      const module = await import(/* @vite-ignore */ url);
      verified.set(entry.integrity, module);
      return module;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  get json() {
    return { entries: this.entries };
  }

  toJSON() {
    return this.json;
  }
}
