export class Process {
  constructor(mask) {
    this.mask = mask;
    this.slug = mask.manifest?.slug;
  }
}
