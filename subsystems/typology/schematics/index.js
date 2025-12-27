export * from "./scalars/index.js";
export * from "./primitives/index.js";
export * from "./entities/index.js";
export * as entities from "./entities/index.js";
export * as scalars from "./scalars/index.js";
export * as primitives from "./primitives/index.js";
// export * as prototypes from "./prototypes/index.js";

import { Type } from "@sinclair/typebox";
import { Timestamp } from "./scalars/index.js";

export const StatusCode = Type.Union([
  Type.Literal("IDLE"),
  Type.Literal("HEALTHY"),
  Type.Literal("PENDING"),
  Type.Literal("ACTIVE"),
  Type.Literal("SUCCESS"),
  Type.Literal("ERROR"),
]);

export const Status = Type.Object({
  timestamp: Timestamp,
  code: Type.Optional(Type.String()),
});

export const ErrorResponse = Type.Object({
  success: Type.Literal(false),
  message: Type.Optional(Type.String()),
  error: Type.Optional(Type.Any()),
});
