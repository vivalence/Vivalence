import { fn } from "@vivalence/typology";

export class Cargo {
  catalog = {};
  sought = new Set();

  constructor(connection) {
    this.connection = connection;
    this.refresh = fn.debounce(() => this.refetch(), 2000);
  }

  async refetch() {
    this.catalog = await this.connection.call("/metadata/cargo");
  }

  resolve(asset) {
    if (!asset) return null;
    if (asset.path) {
      const found = this.catalog[asset.path] ?? null;
      if (!found && !this.sought.has(asset.path)) {
        this.sought.add(asset.path);
        this.refresh();
      }
      return found;
    }
    if (asset.slug) {
      const entry = Object.entries(this.catalog).find(
        ([key]) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
      );
      return entry?.[1] ?? null;
    }
    return null;
  }
}
