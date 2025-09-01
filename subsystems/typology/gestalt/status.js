import { Type } from "@sinclair/typebox";

const StatusCode = Type.Union([
  Type.Literal("PENDING"),
  Type.Literal("IDLE"),
  Type.Literal("WIP"),
  Type.Literal("SUCCESS"),
  Type.Literal("ERROR"),
  Type.Literal("TIMEOUT"),
  Type.Literal("UNAUTHORIZED"),
  Type.Literal("FORBIDDEN"),
  Type.Literal("NOT_FOUND"),
  Type.Literal("RATE_LIMITED"),
]);

const ErrorStatus = Type.Object({
  name: Type.String(),
  message: Type.String(),
  code: Type.Optional(Type.String()),
  stack: Type.Optional(Type.String()),
});

export const Status = Type.Object({
  label: Type.String(),
  code: StatusCode,
  timestamp: Type.String(),
  message: Type.Optional(Type.String()),
  error: Type.Optional(ErrorStatus),
});
