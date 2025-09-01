import { Type } from "@sinclair/typebox";

export const Slug = Type.String({
  pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
  description: "Context-unique URL-compliant identifier",
});

export const ID = Type.String({
  minLength: 1,
  description: "Unique identifier",
});
