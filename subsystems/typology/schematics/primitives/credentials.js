import { v } from "../v.js";
import { Timestamp } from "../scalars/index.js";
import { AuthorityToken, UserReference } from "./auth.js";

export const Credential = v.object(
  {
    user: UserReference,
    authority: AuthorityToken,
    at: Timestamp.desc("When the lighthouse handed these out. Example: 2026-10-10T21:03:24.000Z"),
  },
  { additionalProperties: false },
);

export const Credentials = v.record(
  v.string().desc("The lighthouse origin. Example: http://localhost:2501"),
  Credential,
);
