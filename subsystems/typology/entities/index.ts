export * from "./base/BaseEntity.ts";
export * from "./base/VirtualEntity.ts";
export * from "./base/DataEntity.ts";
export { trait } from "./base/trait.js";

export * from "./kernel/Literal.ts";
export * from "./kernel/Symbol.ts";
// export * from "./kernel/Subject.ts";
// export * from "./kernel/Dimension.ts";
export * from "./kernel/Issue.ts";
export * from "./kernel/Constraint.ts";

export * from "./network/Identity.ts";
export * from "./network/Daemon.ts";

export * from "./daemon/Mode.ts";
export * from "./daemon/Intent.ts";
export * from "./daemon/User.ts";

export * from "./userspace/Buffer.ts";
export * from "./userspace/Session.ts";

// import subject from "./kernel/Subject.ts";
// import dimension from "./kernel/Dimension.ts";
import literal from "./kernel/Literal.ts";
import symbol from "./kernel/Symbol.ts";
import issue from "./kernel/Issue.ts";
import constraint from "./kernel/Constraint.ts";

import identity from "./network/Identity.ts";
import daemon from "./network/Daemon.ts";

import intent from "./daemon/Intent.ts";
import mode from "./daemon/Mode.ts";
import user from "./daemon/User.ts";

import session from "./userspace/Session.ts";
import buffer from "./userspace/Buffer.ts";

// import virtual from "./base/VirtualEntity.ts";
// import data from "./base/DataEntity.ts";
// import base from "./base/BaseEntity.ts";
// export const entity = [base, data, virtual];

export const daemon = [intent, user, mode];

export const userspace = [
  session,
];

export const kernel = [
  // constraint,
  // issue,
  literal,
  symbol,
  // subject,
  // dimension,
];

export const network = [identity, daemon];

export const sets = {
  network,
  daemon,
  userspace,
  kernel,
};

export const maps = {
  virtual: {
    constraint,
    issue,
  },
  network: {
    identity,
    daemon,
  },
  daemon: {
    intent,
    mode,
    user,
  },
  userspace: {
    buffer,
    session,
  },
  kernel: {
    literal,
    symbol,
    // subject,
    // dimension,
    // constraint,
    // issue,
  },
  sets,
};
