import { hash } from "@vivalence/shared";
import { Signature } from "./signature.js";

export class Feature extends Signature {
  // ought(thing) {return is.feature(thing);}
  constructor(data = {}) {
    super();
    this.token = data.token || {};
    this.annotation = data.annotation || {};
    // this.nature = {token,annotation}; //token, annotation as getters?
    this.signal = data.signal || null;
  }

  hasher() {
    return hash.array([
      this.index,
      this.token,
      this.annotation,
      this.signal?.hash,
    ]);
  }

  // from(signal) {
  //   if (!this.signal) this.signal = signal;
  //   return this;
  // }

  get cached() {
    return JSON.stringify({ token: this.token, annotation: this.annotation });
  }
  static fromCache(cache) {
    return new Feature(JSON.parse(cache));
  }
}

// export const feature = (data) => new Feature(data);
