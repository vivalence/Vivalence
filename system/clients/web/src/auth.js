import { env } from "$env/dynamic/public";

import { Auth } from "@client/lib/auth/index.js";
import { Call } from "@client/lib/call/index.js";

export const auth = new Auth(
  new Call(env["PUBLIC_VIVA_IDENTITY_AUTHORITY_URL"]),
);

export default auth;
