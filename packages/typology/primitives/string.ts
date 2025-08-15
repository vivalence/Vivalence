import { Type } from "@sinclair/typebox";

export const Slug = Type.String({
  pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  description: "URL-compliant identifier (lowercase, hyphens allowed)",
});

export const Name = Type.String({
  minLength: 1,
  maxLength: 100,
  description: "Human-readable name",
});

export const Description = Type.String({
  maxLength: 500,
  description: "Descriptive text",
});

export const Version = Type.String({
  pattern: "^\\d+\\.\\d+\\.\\d+$",
  description: "Semantic version (major.minor.patch)",
});

export const ID = Type.String({
  minLength: 1,
  description: "Unique identifier",
});
