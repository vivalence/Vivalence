export * from "./base/BaseEntity.ts";
export * from "./base/VirtualEntity.ts";
export * from "./base/DataEntity.ts";

export * from "./kernel/Literal.ts";
export * from "./kernel/Symbol.ts";
export * from "./kernel/Subject.ts";
export * from "./kernel/Dimension.ts";

export * from "./system/Identity.ts";
export * from "./system/Daemon.ts";
export * from "./system/Mode.ts";
export * from "./system/Valence.ts";
export * from "./system/Issue.ts";
// export * from "./system/Constraint.ts";

export * from "./userspace/User.ts";
export * from "./userspace/Session.ts";
export * from "./userspace/Intent.ts";

import subject from "./kernel/Subject.ts";
import dimension from "./kernel/Dimension.ts";
import literal from "./kernel/Literal.ts";
import symbol from "./kernel/Symbol.ts";

import identity from "./system/Identity.ts";
import valence from "./system/Valence.ts";
import daemon from "./system/Daemon.ts";
import mode from "./system/Mode.ts";
// import constraint from "./system/Constraint.ts";
import issue from "./system/Issue.ts";

import intent from "./userspace/Intent.ts";
import session from "./userspace/Session.ts";
import user from "./userspace/User.ts";

// import virtual from "./base/VirtualEntity.ts";
// import data from "./base/DataEntity.ts";
// import base from "./base/BaseEntity.ts";
// export const entity = [base, data, virtual];

export const system = [
  // constraint, // not data?
  issue,
  identity,
  daemon,
  valence,
  mode,
];
export const userspace = [user, intent, session];
export const kernel = [literal, symbol, subject, dimension];

export const sets = {
  system,
  userspace,
  kernel,
};

export const maps = {
  system: {
    identity,
    valence,
    mode,
    daemon,
    issue,
    // constraint,
  },
  userspace: {
    user,
    intent,
    session,
  },
  kernel: {
    literal,
    symbol,
    subject,
    dimension,
  },
  sets,
};
