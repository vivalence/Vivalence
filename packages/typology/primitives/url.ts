import { Type } from "@sinclair/typebox";

export const URL = Type.String({
  format: "uri",
  description: "Valid URL",
});

export const Domain = Type.String({
  pattern:
    "^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
  description: "Domain name",
});

export const BaseURL = Type.String({
  pattern: "^https?://[^/]+$",
  description: "Base URL without path",
});
