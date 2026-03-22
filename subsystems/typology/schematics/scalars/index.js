import { Type } from "typebox";

export { Type, Infer } from "typebox";
export { Value } from "typebox/value";
export { System } from "typebox/system";
export { Compile, Validator } from "typebox/compile";
export { IsValidationError } from "typebox/error";

export const ID = Type.String({
  minLength: 1,
  description: "Unique identifier (UUID)",
});

export const Slug = Type.String({
  pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  description: "URL-compliant identifier",
});

export const Ref = Type.Union([ID, Type.Object({ id: ID }, { additionalProperties: true })], {
  $id: "Ref",
});

Ref.to = (schema) => Type.Union([ID, Type.Ref(schema)]);

export const JWTToken = Type.String({
  pattern: "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$",
  description: "JWT token string",
});

export const Timestamp = Type.String({
  format: "date-time",
  description: "ISO 8601 timestamp",
});

export const Username = Type.String({
  minLength: 1,
  maxLength: 64,
  description: "User identifier",
});

export const Password = Type.String({
  minLength: 1,
  description: "Password string",
});
