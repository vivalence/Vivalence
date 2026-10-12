import { Signature } from "./signature.js";
import * as is from "../gestalten/is/scalars.js";
import * as hash from "../gestalten/belt/hash.js";

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
