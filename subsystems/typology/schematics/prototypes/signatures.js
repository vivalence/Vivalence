import { Type } from "typebox";
import { enhance } from "../v.js";
import { url } from "../scalars/url.js";
import { Signature as SignatureProto } from "../../prototypes/signature.js";
import { Signal as SignalProto } from "../../prototypes/signal.js";
import { Path as PathProto } from "../../prototypes/path.js";
import { FilePath as FilePathProto } from "../../prototypes/filepath.js";
import { Url as UrlProto } from "../../prototypes/url.js";
import { Action as ActionProto } from "../../prototypes/action.js";
import { Pattern as PatternProto } from "../../prototypes/pattern.js";

// Each Signature derivative is a codec: Decode unfolds the wire string into the live
// prototype (ana), Encode folds the prototype back to its canonical string (cata).
// The wire is always a string; the runtime value is the prototype, with the tree
// algebra (branch/heritage/array) riding along.

const token = (options) => Type.String({ pattern: "^\\S+$", ...options });
const text = (options) => Type.String({ pattern: "^.+$", ...options });
const path = (signature) => signature.pathname ?? "/" + signature.absolute.join("/");
const rooted = (signature) => "/" + signature.absolute.join("/");

const codec = (Prototype, wire, encode) => (options) =>
  enhance(Type.Codec(wire(options)).Decode((held) => new Prototype(held)).Encode(encode));

export const Signature = codec(SignatureProto, token, rooted);
export const Signal = codec(SignalProto, token, path);
export const Path = codec(PathProto, token, path);
export const FilePath = codec(FilePathProto, text, (s) => s.absolute);
export const Url = codec(UrlProto, url, (s) => s.absolute);
export const Action = codec(ActionProto, token, rooted);
export const Pattern = codec(PatternProto, text, rooted);
