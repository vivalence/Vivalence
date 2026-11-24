import type {
  Static,
  StaticDecode,
  TLiteral,
  TLiteralValue,
  TOptional,
  TProperties,
  TSchema,
  TSchemaOptions,
  TString,
  TUnion,
  TUnsafe,
  Type,
} from "typebox";
import type { Compile } from "typebox/compile";
import type { Value } from "typebox/value";

export interface Fault {
  at: string;
  reason: string;
}

export interface Position<Held extends TSchema> {
  at: string;
  value: Static<Held>;
}

export type Schematic<Schema extends TSchema = TSchema> = Schema & {
  desc(text: string): Schematic<Schema>;
  descr(text: string): Schematic<Schema>;
  example(...examples: Static<Schema>[]): Schematic<Schema>;
  eg(...examples: Static<Schema>[]): Schematic<Schema>;
  default(value: Partial<Static<Schema>>): Schematic<Schema>;
  group(name: string): Schematic<Schema>;
  $id<Name extends string>(name: Name): Schematic<Schema & { $id: Name }>;
  optional(): Schematic<TOptional<Schema>>;

  check(value: unknown): value is Static<Schema>;
  cast(value: unknown): Static<Schema>;
  fill(value: unknown): Static<Schema>;
  create(): Static<Schema>;
  repair(value: unknown): Static<Schema>;
  decode(value: unknown): StaticDecode<Schema>;
  encode(value: StaticDecode<Schema>): Static<Schema>;
  clean(value: unknown): unknown;

  errors(value: unknown): ReturnType<typeof Value.Errors>;
  faults(value: unknown): Fault[];
  collect<Held extends TSchema>(value: unknown, held: Held): Position<Held>[];
  compile(): ReturnType<typeof Compile>;
};

type Literals<Values extends readonly unknown[]> = Values extends
  readonly [infer Head extends TLiteralValue, ...infer Tail] ? [TLiteral<Head>, ...Literals<Tail>]
  : [];

type Enumerated<Values extends readonly TLiteralValue[]> = number extends Values["length"]
  ? TUnsafe<Values[number]>
  : TUnion<Literals<Values>>;

export function enhance<Schema extends TSchema>(schema: Schema): Schematic<Schema>;

export function entityFactory(schematic: unknown): any;

export const v: {
  string(...options: Parameters<typeof Type.String>): Schematic<TString>;
  number(...options: Parameters<typeof Type.Number>): Schematic<ReturnType<typeof Type.Number>>;
  integer(...options: Parameters<typeof Type.Integer>): Schematic<ReturnType<typeof Type.Integer>>;
  boolean(...options: Parameters<typeof Type.Boolean>): Schematic<ReturnType<typeof Type.Boolean>>;
  any(): Schematic<ReturnType<typeof Type.Any>>;
  unknown(): Schematic<ReturnType<typeof Type.Unknown>>;
  null(): Schematic<ReturnType<typeof Type.Null>>;

  object<Properties extends TProperties>(
    ...declared: Parameters<typeof Type.Object<Properties>>
  ): Schematic<ReturnType<typeof Type.Object<Properties>>>;

  array<Items extends TSchema>(
    ...declared: Parameters<typeof Type.Array<Items>>
  ): Schematic<ReturnType<typeof Type.Array<Items>>>;

  record<Key extends TSchema, Held extends TSchema>(
    ...declared: Parameters<typeof Type.Record<Key, Held>>
  ): Schematic<ReturnType<typeof Type.Record<Key, Held>>>;

  union<Variants extends TSchema[]>(
    ...declared: Parameters<typeof Type.Union<Variants>>
  ): Schematic<ReturnType<typeof Type.Union<Variants>>>;

  intersect<Parts extends TSchema[]>(
    ...declared: Parameters<typeof Type.Intersect<Parts>>
  ): Schematic<ReturnType<typeof Type.Intersect<Parts>>>;

  interface<Heritage extends TSchema[], Properties extends TProperties>(
    ...declared: Parameters<typeof Type.Interface<Heritage, Properties>>
  ): Schematic<ReturnType<typeof Type.Interface<Heritage, Properties>>>;

  const<Value extends TLiteralValue>(value: Value): Schematic<TLiteral<Value>>;

  enum<const Values extends readonly TLiteralValue[]>(
    values: Values,
    options?: TSchemaOptions,
  ): Schematic<Enumerated<Values>>;

  $ref<Reference extends string>(reference: Reference): Schematic<ReturnType<typeof Type.Ref<Reference>>>;

  instant(...options: Parameters<typeof Type.String>): Schematic<TString>;
  date(...options: Parameters<typeof Type.String>): Schematic<TString>;
  duration(...options: Parameters<typeof Type.String>): Schematic<TString>;
  datetime(...options: Parameters<typeof Type.String>): Schematic<TString>;
  zoned(...options: Parameters<typeof Type.String>): Schematic<TString>;

  check<Schema extends TSchema>(schema: Schema, value: unknown): value is Static<Schema>;
  cast<Schema extends TSchema>(schema: Schema, value: unknown): Static<Schema>;
  fill<Schema extends TSchema>(schema: Schema, value: unknown): Static<Schema>;
  create<Schema extends TSchema>(schema: Schema): Static<Schema>;
  decode<Schema extends TSchema>(schema: Schema, value: unknown): StaticDecode<Schema>;
  encode<Schema extends TSchema>(schema: Schema, value: StaticDecode<Schema>): Static<Schema>;
  convert(schema: TSchema, value: unknown): unknown;
  clean(schema: TSchema, value: unknown): unknown;
  errors: typeof Value.Errors;
  faults(schema: TSchema, value: unknown): Fault[];
  collect<Held extends TSchema>(schema: TSchema, value: unknown, held: Held): Position<Held>[];
  compile: typeof Compile;

  diff: typeof Value.Diff;
  patch: typeof Value.Patch;
  equal: typeof Value.Equal;
  clone: typeof Value.Clone;
  isOptional(schema: TSchema): boolean;
  isNever(schema: TSchema): boolean;
};
