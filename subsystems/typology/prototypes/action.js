import { Signature } from "./signature.js";
import { is } from "@vivalence/typology";
import { hash } from "@vivalence/shared";

export class Action extends Signature {
  static coercions = [
    [(s) => is.string(s), (s) => s.replace(/\/+/g, "/")],
    [
      (a) => is.object(a) && a.nature,
      (a) => {
        return {
          ...a,
          nature: a.nature.replace(/\/+/g, "/"),
        };
      },
    ],
  ];

  apply(signal) {
    return signal.nature === this.nature ? signal : null;
  }

  hasher() {
    return hash.array(this.absolute);
  }
}
