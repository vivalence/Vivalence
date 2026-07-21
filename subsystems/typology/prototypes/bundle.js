import { digest } from "../gestalten/belt/crypto.js";

const verified = new Map();

export class Bundle {
  url = null;
  entries = [];

  constructor(record = {}) {
    if (record instanceof Bundle) return record;
    if (Array.isArray(record)) record = { entries: record };
    this.entries = record.entries ?? [];
    this.url = record.url ?? null;
  }

  entry(mount) {
    return this.entries.find((candidate) => candidate.mount === mount);
  }

  withUrl(url) {
    this.url = url;
    return this;
  }

  async load(mount) {
    const entry = this.entry(mount) ?? this.entries[0];
    if (!entry) throw new Error("bundle has no entries");
    if (entry.integrity && verified.has(entry.integrity)) return verified.get(entry.integrity);
    const response = await fetch(this.url + entry.mount);
    if (!response.ok) throw new Error(`bundle fetch ${response.status}`);
    const text = await response.text();
    if (entry.integrity) {
      const digested = await digest(text);
      if (digested !== entry.integrity)
        throw new Error(`integrity sha256 ${digested.slice(0, 12)} is not ${entry.integrity.slice(0, 12)}`);
    }
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    try {
      const module = await import(/* @vite-ignore */ url);
      if (entry.integrity) verified.set(entry.integrity, module);
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
