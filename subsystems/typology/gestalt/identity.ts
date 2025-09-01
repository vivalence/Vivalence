import { Type } from "@sinclair/typebox";
import { Slug } from "../primitives/index.ts";

const Authenticator = Type.Object({
  provider: Type.String(), // "local", "google", "github"
  credentials: Type.Record(Type.String(), Type.Any()), // flexible cred storage
  tokens: Type.Record(Type.String(), Type.String()), // access, refresh, etc.
});

export const Identity = Type.Object({
  slug: Slug,
  authentication: Type.Array(Authenticator),
  shards: Type.Array(Shard),
});

export const Shard = Type.Object({
  type: Type.String(),
  url: Type.String(),
  slug: Slug,
});
