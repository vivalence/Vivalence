export { wrap, helper } from "@mikro-orm/core";

export * from "./base/DataEntity.ts";
export * from "./base/VirtualEntity.ts";
export { trait } from "./base/trait.js";

export * from "./kernel/Literal.ts";
export * from "./kernel/Symbol.ts";
export * from "./kernel/Issue.ts";
export * from "./kernel/Constraint.ts";

export * from "./network/Identity.ts";
export * from "./network/Daemon.ts";

export * from "./daemon/Mode.ts";
export * from "./daemon/Intent.ts";
export * from "./daemon/User.ts";

export * from "./userspace/Buffer.ts";
export * from "./userspace/Thread.ts";

import literal from "./kernel/Literal.ts";
import symbol from "./kernel/Symbol.ts";
import issue from "./kernel/Issue.ts";
import constraint from "./kernel/Constraint.ts";

import identity from "./network/Identity.ts";
import daemon from "./network/Daemon.ts";

import intent from "./daemon/Intent.ts";
import mode from "./daemon/Mode.ts";
import user from "./daemon/User.ts";

import thread from "./userspace/Thread.ts";
import buffer from "./userspace/Buffer.ts";

export { literal, symbol, issue, constraint };
export { identity, daemon };
export { intent, mode, user };
export { thread, buffer };

export const sets = {
  network: [identity, daemon],
  daemon: [intent, user, mode],
  kernel: [literal, symbol],
  userspace: [thread, buffer], //
};
