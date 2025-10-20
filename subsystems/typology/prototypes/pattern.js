import { is } from "@vivalence/typology";
import { hash } from "@vivalence/shared";
import { Signature } from "./signature.js";

export class Pattern extends Signature {
  // filter = null;
  hasher() {
    return hash.array([
      this.index,
      this.type,
      this.signature,
      this.trace?.hash,
    ]);
    // i could make the hash reactive for shits and giggles.
  }

  ought(thing) {
    return is.pattern(thing);
  }

  parse(string) {
    const segments = string
      .split("/")
      .filter((s) => s.length > 0)
      .map((signature) => {
        const [type, , filter] = probe(signature);
        if (type && filter) return { type, signature, filter };
      })
      .filter((segment) => segment);
    return segments;
  }

  apply(signal) {
    // assert constraints. // ie this: this.filter = signature; // TODO wrap for asserting filter in output.
    // yeah i need to do some stuff here.
    return this.filter ? this.filter(signal, this) : null;
  }
}

const probe = (signature) => patternmap.find(([, probe]) => probe(signature));

const patternmap = [
  ["wildcard", (signature) => signature === "*", (signal) => signal],
  ["remainder", (signature) => signature === "(.*)", (signal) => signal],
  [
    "parameter",
    (signature) => signature.startsWith(":"),
    (signal, pattern) => {
      const parameter = pattern.signature.slice(1);
      return {
        ...signal,
        parameter,
        parameters: { [parameter]: signal.signature },
      };
    },
  ],
  [
    "literal",
    (signature) => true,
    (signal, pattern) =>
      signal.signature === pattern.signature ? signal : null,
  ],
];
