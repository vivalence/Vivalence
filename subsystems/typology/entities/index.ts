export * from "./base/BaseEntity.ts";
export * from "./base/VirtualEntity.ts";
export * from "./base/DataEntity.ts";

export * from "./kernel/Literal.ts";
export * from "./kernel/Symbol.ts";
export * from "./kernel/Subject.ts";
export * from "./kernel/Dimension.ts";
export * from "./kernel/Issue.ts";
// export * from "./kernel/Constraint.ts";

export * from "./network/Identity.ts";
export * from "./network/Daemon.ts";

export * from "./runtime/Mode.ts";
export * from "./runtime/Valence.ts";
export * from "./runtime/User.ts";

// export * from "./userspace/Product.ts";
export * from "./userspace/Session.ts";
export * from "./userspace/Intent.ts";

import subject from "./kernel/Subject.ts";
import dimension from "./kernel/Dimension.ts";
import literal from "./kernel/Literal.ts";
import symbol from "./kernel/Symbol.ts";
import issue from "./kernel/Issue.ts";
// import constraint from "./kernel/Constraint.ts";

import identity from "./network/Identity.ts";
import daemon from "./network/Daemon.ts";

import valence from "./runtime/Valence.ts";
import mode from "./runtime/Mode.ts";
import user from "./runtime/User.ts";

import intent from "./userspace/Intent.ts";
import session from "./userspace/Session.ts";
// import product from "./userspace/Product.ts";

// import virtual from "./base/VirtualEntity.ts";
// import data from "./base/DataEntity.ts";
// import base from "./base/BaseEntity.ts";
// export const entity = [base, data, virtual];

export const runtime = [valence, user, mode];

export const userspace = [
  // product,
  intent,
  session,
];

export const kernel = [
  // constraint,
  // issue,
  literal,
  symbol,
  subject,
  dimension,
];

export const network = [identity, daemon];

export const sets = {
  network,
  runtime,
  userspace,
  kernel,
};

export const maps = {
  network: {
    identity,
    daemon,
  },
  runtime: {
    valence,
    mode,
    user,
  },
  userspace: {
    intent,
    session,
    // product,
  },
  kernel: {
    literal,
    symbol,
    subject,
    dimension,
    // constraint,
    // issue,
  },
  sets,
};
