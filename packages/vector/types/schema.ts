// import { Type, Static } from "@vivalence/typology";
// import { Type, Static } from "@sinclair/typebox";

export const Signal = Type.Object({
  type: Type.String(),
  signature: Type.Any(),
});

export const Pattern = Type.Object({
  parser: Type.String(),
  type: Type.String(),
  index: Type.Number(),
  signature: Type.String(),
  valence: Type.Union([Type.String(), Type.Null()]),
  hash: Type.String(),
  match: Type.Function([Signal], Type.Union([Type.Any(), Type.Null()])),
});

// export const Effect = Type.Function(
//   [Type.Any(), Context],
//   Type.Promise(Type.Any()),
// );

// export const Parser = Type.Object({
//   parser: Type.String(),
//   pattern: Type.Function([Type.Any()], Type.Array(Pattern)),
//   signal: Type.Function([Type.Any()], Type.Array(Signal)),
// });

// export const Vector = Type.Object({
//   parsers: Type.Array(Parser),
//   effects: Type.Any(),
//   descendants: Type.Any(),
//   middlewares: Type.Array(Middleware),
// });

// Signatures
