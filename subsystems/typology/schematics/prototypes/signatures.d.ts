import type { TCodec, TString } from "typebox";
import type { Schematic, v } from "../v.d.ts";
import type { Signature as SignatureProto } from "../../prototypes/signature.js";
import type { Signal as SignalProto } from "../../prototypes/signal.js";
import type { Path as PathProto } from "../../prototypes/path.js";
import type { FilePath as FilePathProto } from "../../prototypes/filepath.js";
import type { Url as UrlProto } from "../../prototypes/url.js";
import type { Action as ActionProto } from "../../prototypes/action.js";
import type { Pattern as PatternProto } from "../../prototypes/pattern.js";

type Options = Parameters<typeof v.string>[0];
type Codec<Prototype> = (options?: Options) => Schematic<TCodec<TString, Prototype>>;

export const Signature: Codec<SignatureProto>;
export const Signal: Codec<SignalProto>;
export const Path: Codec<PathProto>;
export const FilePath: Codec<FilePathProto>;
export const Url: Codec<UrlProto>;
export const Action: Codec<ActionProto>;
export const Pattern: Codec<PatternProto>;
