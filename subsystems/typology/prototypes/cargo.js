export class Cargo {
  freights = () => [];

  constructor(freights) {
    if (freights) this.freights = freights;
  }

  get catalog() {
    const folded = {};
    for (const freight of this.freights()) Object.assign(folded, freight.catalog);
    return folded;
  }

  toJSON() {
    return this.catalog;
  }
}
