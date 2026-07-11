import { Type } from "typebox";
import { enhance } from "../v.js";
import { Signature as SignatureProto } from "../../prototypes/signature.js";
import { Signal as SignalProto } from "../../prototypes/signal.js";
import { Path as PathProto } from "../../prototypes/path.js";
import { Url as UrlProto } from "../../prototypes/url.js";
import { Action as ActionProto } from "../../prototypes/action.js";
import { Pattern as PatternProto } from "../../prototypes/pattern.js";

// Each Signature derivative is a codec: Decode unfolds the wire string into the live
// prototype (ana), Encode folds the prototype back to its canonical string (cata).
// The wire is always a string; the runtime value is the prototype, with the tree
// algebra (branch/heritage/array) riding along.

const PATH = "^\\S+$";
const path = (signature) => signature.pathname ?? "/" + signature.absolute.join("/");

const codec =
  (Prototype, { pattern = PATH, encode = path } = {}) =>
  (options) =>
    enhance(
      Type.Codec(Type.String({ pattern, ...options }))
        .Decode((wire) => new Prototype(wire))
        .Encode(encode),
    );

export const Signature = codec(SignatureProto, { encode: (s) => "/" + s.absolute.join("/") });
export const Signal = codec(SignalProto);
export const Path = codec(PathProto);
export const Url = codec(UrlProto, { pattern: "^.+$", encode: (s) => s.absolute });
export const Action = codec(ActionProto, { encode: (s) => "/" + s.absolute.join("/") });
export const Pattern = codec(PatternProto, { pattern: "^.+$", encode: (s) => "/" + s.absolute.join("/") });
