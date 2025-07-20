// import { Type, Static } from "@sinclair/typebox";

// export const Signature = Type.Array()

// export const Signal = Type.Object({
//   // type: Type.String(),
//   // value: Type.Any(),
// });

// export const Pattern = Type.Object({
//   parser: Type.String(),
//   hash: Type.String(),
//   meta: Type.Record(Type.String(), Type.Any()),
//   match: Type.Function([Signal], Type.Union([Type.Any(), Type.Null()])),
// });

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

// // export const Context = Type.Record(Type.String(), Type.Any())
// // export const Middleware = Type.Function([
// //   Type.Any(),
// //   Context,
// //   Type.Function([], Type.Promise(Type.Any()))
// // ], Type.Promise(Type.Any()))
