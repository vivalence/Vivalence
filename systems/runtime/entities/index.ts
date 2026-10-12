export { wrap, helper } from "@mikro-orm/core";

export * from "@vivalence/typology/entities";

export * from "./Literal.ts";
export * from "./Symbol.ts";
export * from "./Mode.ts";
export * from "./User.ts";
export * from "./Terminal.ts";
export * from "./Daemon.ts";
export { traits as kernel } from "./traits.js";

export * from "./Intent.ts";
export * from "./Buffer.ts";
export * from "./Thread.ts";
export * from "./Turn.ts";
export * from "./Note.ts";
export * from "./Activity.ts";
export * from "./Process.ts";

import literal from "./Literal.ts";
import symbol from "./Symbol.ts";
import mode from "./Mode.ts";
import user, { authenticator } from "./User.ts";
import terminal from "./Terminal.ts";
import daemon from "./Daemon.ts";

import intent from "./Intent.ts";
import thread from "./Thread.ts";
import turn from "./Turn.ts";
import buffer from "./Buffer.ts";
import note from "./Note.ts";
import activity from "./Activity.ts";

export { literal, symbol };
export { intent, mode, user };
export { thread, turn, buffer };
export { activity };

export const sets = {
  identity: { user, authenticator, terminal },
  composition: { daemon, mode },
  traits: { literal, symbol, note, mode },
  userspace: { intent, thread, turn, buffer, note },
  transient: { activity },
};
