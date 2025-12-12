import { Type } from "@sinclair/typebox";

export const Slug = Type.String({
  pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  description: "URL-compliant identifier",
});

export const ID = Type.String({
  minLength: 1,
  description: "Unique identifier (UUID)",
});

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

export { Type };
