import { hash } from "@vivalence/shared";
import { Signature } from "./signature.js";
import { is } from "@vivalence/typology";

export class Signal extends Signature {
  // is = is.signal; // js...
  hasher() {
    return hash.array([this.index, this.signature]);
  }
  // is(s) {return is.signal(s);}
  ought(thing) {
    return is.signal(thing);
  }
  parse(string) {
    return string
      .split("/")
      .filter((s) => s.length > 0)
      .map((signature) => ({ signature }));
  }
}
