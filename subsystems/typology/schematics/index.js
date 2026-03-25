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
  BaseEntitySchema,
  BufferDescriptor,
  LiteralDescriptor,
  SymbolDescriptor,
  ModeDescriptor,
  IntentDescriptor,
  SessionDescriptor,
  UserDescriptor,
} from "./entities/index.js";

v.rel     = (schema) => v.union([ID, schema]);
v.literal = entityFactory(LiteralDescriptor, BaseEntitySchema);
v.symbol  = entityFactory(SymbolDescriptor, BaseEntitySchema);
v.buffer  = entityFactory(BufferDescriptor, BaseEntitySchema);
v.mode    = entityFactory(ModeDescriptor, BaseEntitySchema);
v.intent  = entityFactory(IntentDescriptor, BaseEntitySchema);
v.session = entityFactory(SessionDescriptor, BaseEntitySchema);
v.user    = entityFactory(UserDescriptor, BaseEntitySchema);

export { v };
