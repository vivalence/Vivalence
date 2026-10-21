import { Vector } from "@vivalence/typology";

export class Service {
  type = "service";
  attachment = new Vector();
  slug = null;
  mask = null;
  controller = null;

  constructor(fields) {
    Object.assign(this, fields);
  }

  get manifest() {
    return this.mask.manifest;
  }

  get reference() {
    return this.mask.reference;
  }
}
