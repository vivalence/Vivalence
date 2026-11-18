import { Vector } from "@vivalence/typology";

export class Service {
  type = "service";
  attachment = new Vector();
  mask = null;
  module = null;
  controller = null;

  constructor(fields) {
    Object.assign(this, fields);
  }

  get slug() {
    return this.mask.manifest.slug;
  }

  get manifest() {
    return this.module.manifest;
  }

  get reference() {
    return this.mask.reference;
  }
}
