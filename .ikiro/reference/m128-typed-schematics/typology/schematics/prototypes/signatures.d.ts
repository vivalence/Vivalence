import type { TCodec, TString } from "typebox";
import type { Action as ActionPrototype } from "../../prototypes/action.js";
import type { FilePath as FilePathPrototype } from "../../prototypes/filepath.js";
import type { Path as PathPrototype } from "../../prototypes/path.js";
import type { Pattern as PatternPrototype } from "../../prototypes/pattern.js";
import type { Signal as SignalPrototype } from "../../prototypes/signal.js";
import type { Signature as SignaturePrototype } from "../../prototypes/signature.js";
import type { Url as UrlPrototype } from "../../prototypes/url.js";
import type { Schematic, v } from "../v.d.ts";

type Options = Parameters<typeof v.string>[0];
type Codec<Prototype> = (options?: Options) => Schematic<TCodec<TString, Prototype>>;

export const Signature: Codec<SignaturePrototype>;
export const Signal: Codec<SignalPrototype>;
export const Path: Codec<PathPrototype>;
export const FilePath: Codec<FilePathPrototype>;
export const Url: Codec<UrlPrototype>;
export const Action: Codec<ActionPrototype>;
export const Pattern: Codec<PatternPrototype>;
