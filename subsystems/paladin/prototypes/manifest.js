export class Manifest {
  //
  constructor(manifest) {
    Object.assign(this, manifest);
  }
  get identifier() {
    return `${this.owner}/${this.type}/${this.slug}`;
  }
}
