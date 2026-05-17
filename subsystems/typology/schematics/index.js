import { v, entityFactory } from "./v.js";
import * as scalars from "./scalars/index.js";
import * as primitives from "./primitives/index.js";
import * as entities from "./entities/index.js";

v.scalars    = scalars;
v.primitives = primitives;
v.entities   = entities;

v.rel     = (schema) => v.union([scalars.ID, schema]);
v.literal = entityFactory(entities.LiteralDescriptor, entities.DataEntitySchema);
v.symbol  = entityFactory(entities.SymbolDescriptor,  entities.DataEntitySchema);
v.buffer  = entityFactory(entities.BufferDescriptor,  entities.DataEntitySchema);
v.mode    = entityFactory(entities.ModeDescriptor,    entities.DataEntitySchema);
v.intent  = entityFactory(entities.IntentDescriptor,  entities.DataEntitySchema);
v.thread  = entityFactory(entities.ThreadDescriptor,  entities.DataEntitySchema);
v.user    = entityFactory(entities.UserDescriptor,    entities.DataEntitySchema);

export { v };
