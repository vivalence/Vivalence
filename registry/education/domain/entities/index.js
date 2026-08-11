import symbol from "./kernel/Symbol.ts";
import literal from "./kernel/Literal.ts";

import retention from "./userspace/Retention.ts";
import buffer from "./userspace/Buffer.ts";
import trace from "./userspace/Trace.ts";

export const entities = { literal, symbol, buffer, retention, trace };
