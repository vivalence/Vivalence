import { Signature } from "./signature.js";
import { Signal } from "./signal.js";
import { hash, is } from "@vivalence/typology";

export class ToolCall extends Signature {
  static coercions = [
    [
      (thing) => is.string(thing),
      function (thing) {
        return thing
          .split("_")
          .filter((part) => part.length > 0)
          .map((nature) => ({ nature }));
      },
    ],
  ];

  hasher() {
    return hash.array([this.index, this.nature]);
  }

  get name() {
    return this.absolute.join("_");
  }

  get signal() {
    return new Signal(this.absolute.join("/"));
  }
}
