import { Type } from "@sinclair/typebox";

export const URL = Type.Object(
  {
    protocol: Type.String(),
    hostname: Type.String(),
    port: Type.Optional(Type.String()),
    pathname: Type.String(),
    search: Type.Optional(Type.String()),
    hash: Type.Optional(Type.String()),
  },
  {
    description: "URL object",
  },
);
