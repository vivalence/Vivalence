import { hash } from "@vivalence/shared";
import { Signature } from "./signature.js";

export class Feature extends Signature {
  constructor(data = {}) {
    super();
    this.token = data.token || {};
    this.annotation = data.annotation || {};
    this.signal = data.signal || null;
  }

  get hash() {
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
