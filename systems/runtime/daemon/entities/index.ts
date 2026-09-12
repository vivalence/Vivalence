export { wrap, helper } from "@mikro-orm/core";

export * from "./base/DataEntity.ts";
export * from "./base/VirtualEntity.ts";
export { trait } from "./base/trait.js";

export * from "./kernel/Literal.ts";
export * from "./kernel/Symbol.ts";

export * from "./network/Identity.ts";
export * from "./network/Daemon.ts";

export * from "./daemon/Mode.ts";
export * from "./daemon/User.ts";

export * from "./userspace/Intent.ts";
export * from "./userspace/Buffer.ts";
export * from "./userspace/Thread.ts";
export * from "./userspace/Turn.ts";
export * from "./transient/Activity.ts";

import literal from "./kernel/Literal.ts";
import symbol from "./kernel/Symbol.ts";

import identity from "./network/Identity.ts";
import daemon from "./network/Daemon.ts";

import mode from "./daemon/Mode.ts";
import user from "./daemon/User.ts";

import intent from "./userspace/Intent.ts";
import thread from "./userspace/Thread.ts";
import turn from "./userspace/Turn.ts";
import buffer from "./userspace/Buffer.ts";
import activity from "./transient/Activity.ts";

export { literal, symbol };
export { identity, daemon };
export { intent, mode, user };
export { thread, turn, buffer };
export { activity };

export const sets = {
  network: { identity, daemon },
  daemon: { user, mode },
  kernel: { literal, symbol },
  userspace: { intent, thread, turn, buffer },
  transient: { activity },
};
