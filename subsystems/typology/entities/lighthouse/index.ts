export * from "./Identity.ts";
export * from "./Daemon.ts";
export * from "./Terminal.ts";

import identity, { AuthenticatorEmbedEntity, AuthenticatorEmbedSchema } from "./Identity.ts";
import daemon from "./Daemon.ts";
import terminal from "./Terminal.ts";

const authenticator = { type: "authenticator", schema: AuthenticatorEmbedSchema, entity: AuthenticatorEmbedEntity };

export { authenticator, daemon, identity, terminal };
