import type { Static, TSchema } from "typebox";
import type { Pattern } from "./pattern.js";
import type { Signature } from "./signature.js";
import type { Loose } from "./types.d.ts";

export interface Declared<Input extends TSchema = TSchema> {
  nature: string;
  valence?: string;
  chord?: string;
  input?: Input;
  output?: TSchema;
  yields?: TSchema;
  feeds?: TSchema;
  rank?: "active" | "hidden" | "void";
  load?: unknown;
}

export type Carried<Die, Input extends TSchema> = Die & { input: Static<Input> };

export type Middleware<Die> = (die: Die, next: () => Promise<unknown>) => unknown;

export interface Open<Die, Self> {
  <Input extends TSchema>(
    signature: Declared<Input>,
    effect: (die: Carried<Die, Input>) => unknown,
  ): Self;
  <Input extends TSchema>(
    signature: Declared<Input>,
    effect: (input: Static<Input>, die: Carried<Die, Input>) => unknown,
  ): Self;
  (signature: string | Signature, effect: (die: Die) => unknown): Self;
  (signature: string | Signature, effect: (input: unknown, die: Die) => unknown): Self;
}

export class Vector<Die = Loose> {
  constructor(ancestor?: Vector<Die>, signature?: typeof Signature);

  effect: ((die: Die) => unknown) | null;
  trie: Map<Pattern, Vector<Die>>;
  carry: Middleware<Die>[];
  ancestor?: Vector<Die>;
  signature: typeof Signature;

  open: Open<Die, this>;
  do(effect: (die: Die) => unknown): this;
  affect(effect: (die: Die) => unknown): this;
  use(...middlewares: Middleware<Die>[]): this;
  branch(signature: string | Declared | Signature, vector?: Vector<Die>): this;
  graft(...vectors: Vector<any>[]): this;
  trim(signature: string | Signature): this;
  withSignature(signature: typeof Signature): this;

  edge(nature: string): [Pattern, Vector<Die>] | null;
  seat(pattern: Pattern, trajectory?: Vector<Die>): Vector<Die>;
  survey(visit?: (node: unknown) => unknown): unknown;

  readonly patterns: Pattern[];
  readonly descendants: Vector<Die>[];
  readonly root: Vector<Die>;
  readonly heir: Vector<Die> | undefined;
}
