export class Daemon {
  manifest = null;
  mount = null;
  connection = null;
  entities = null;
  cargo = {};

  constructor(connection) {
    this.connection = connection;
  }

  get slug() {
    return this.manifest?.slug ?? null;
  }

  getAsset(asset) {
    if (!this.cargo || !asset) return null;
    if (asset.path) return this.cargo[asset.path] ?? null;
    if (asset.slug) {
      const entry = Object.entries(this.cargo).find(
        ([key]) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
      );
      return entry?.[1] ?? null;
    }
    return null;
  }

  toJSON() {
    return {
      slug: this.slug,
      mount: this.mount?.nature ?? null,
      manifest: this.manifest,
    };
  }
}
