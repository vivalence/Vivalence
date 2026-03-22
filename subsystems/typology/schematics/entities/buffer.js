import { Type, Ref } from "../scalars/index.js";
import { BaseEntitySchema } from "./base.js";

export const BufferSchema = Type.Intersect([
  BaseEntitySchema,
  Type.Object({
    mode: Ref,
    session: Type.Optional(Ref),
    index: Type.Optional(Type.Integer({ default: 0 })),
    data: Type.Record(Type.String(), Type.Unknown()),
    literals: Type.Optional(Type.Array(Ref)),
    symbols: Type.Optional(Type.Array(Ref)),
  }),
], { $id: "Buffer", additionalProperties: true });

BufferSchema.of = (spec = {}) => {
  const overrides = {};
  if (spec.data) {
    overrides.data = Type.Object(spec.data, { additionalProperties: true });
  }
  if (spec.literals) overrides.literals = spec.literals;
  if (spec.symbols) overrides.symbols = spec.symbols;

  return Type.Intersect([
    BufferSchema,
    Type.Object(overrides),
  ], { additionalProperties: true });
};
