import { Signature } from "./signature.js";
import { Signal } from "./signal.js";
import * as hash from "../gestalten/belt/hash.js";
import * as is from "../gestalten/is/index.js";

const CAP = 64;

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
    const underscored = this.absolute.filter((nature) => nature.includes("_"));
    if (underscored.length) throw new Error(`[toolcall] a tool step carries "_", it would not split back: ${underscored.join(" · ")}`);
    const name = this.absolute.join("_");
    if (name.length > CAP) throw new Error(`[toolcall] ${name}: ${name.length} chars, a provider caps a tool name at ${CAP}`);
    return name;
  }

  get signal() {
    return new Signal(this.absolute.join("/"));
  }
}
