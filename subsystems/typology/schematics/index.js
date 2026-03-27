export * from "./lib.js";
// export * from "./prototypes/index.js";
export * from "./scalars/index.js";
export * from "./primitives/index.js";
export * from "./entities/index.js";

export * as scalars from "./scalars/index.js";
export * as primitives from "./primitives/index.js";
export * as prototypes from "./prototypes/index.js";
export * as entities from "./entities/index.js";

import { v, entityFactory } from "./lib.js";
import { ID } from "./scalars/index.js";
import {
  DataEntitySchema,
  BufferDescriptor,
  LiteralDescriptor,
  SymbolDescriptor,
  ModeDescriptor,
  IntentDescriptor,
  ThreadDescriptor,
  UserDescriptor,
} from "./entities/index.js";

v.rel     = (schema) => v.union([ID, schema]);
v.literal = entityFactory(LiteralDescriptor, DataEntitySchema);
v.symbol  = entityFactory(SymbolDescriptor, DataEntitySchema);
v.buffer  = entityFactory(BufferDescriptor, DataEntitySchema);
v.mode    = entityFactory(ModeDescriptor, DataEntitySchema);
v.intent  = entityFactory(IntentDescriptor, DataEntitySchema);
v.thread = entityFactory(ThreadDescriptor, DataEntitySchema);
v.user    = entityFactory(UserDescriptor, DataEntitySchema);

export { v };
