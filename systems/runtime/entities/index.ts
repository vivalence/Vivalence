export { wrap, helper } from "@mikro-orm/core";

export * from "@vivalence/typology/entities";

export * from "./kernel/Literal.ts";
export * from "./kernel/Symbol.ts";

export * from "./kernel/Mode.ts";
export * from "./kernel/User.ts";

export * from "./userspace/Intent.ts";
export * from "./userspace/Buffer.ts";
export * from "./userspace/Thread.ts";
export * from "./userspace/Turn.ts";
export * from "./transient/Activity.ts";
export * from "./transient/Process.ts";
export { assemble } from "./assemble.js";

import { lighthouse } from "@vivalence/typology/entities";

import literal from "./kernel/Literal.ts";
import symbol from "./kernel/Symbol.ts";

import mode from "./kernel/Mode.ts";
import user from "./kernel/User.ts";

import intent from "./userspace/Intent.ts";
import thread from "./userspace/Thread.ts";
import turn from "./userspace/Turn.ts";
import buffer from "./userspace/Buffer.ts";
import activity from "./transient/Activity.ts";

export { literal, symbol };
export { intent, mode, user };
export { thread, turn, buffer };
export { activity };

export const sets = {
  lighthouse: { identity: lighthouse.identity, daemon: lighthouse.daemon },
  kernel: { user, mode, literal, symbol },
  userspace: { intent, thread, turn, buffer },
  transient: { activity },
};
