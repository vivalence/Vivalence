import { env } from "$env/dynamic/public";

import Auth from "@client/lib/auth/index.js";
import { Call } from "@client/lib/call/index.js";
import { UserEntity } from "@client/lib/entities/index.js";

// import { Type } from "@vivalence/typology";

export const authority = new Call(env["PUBLIC_VIVA_IDENTITY_AUTHORITY_URL"]);
export const user = new UserEntity();
export const auth = new Auth(authority, user);

export default { user, auth };
