import { v, entityFactory } from "./v.js";
import * as scalars from "./scalars/index.js";
import * as primitives from "./primitives/index.js";
import * as entities from "./entities/index.js";
import * as prototypes from "./prototypes/index.js";

v.scalars    = scalars;
v.primitives = primitives;
v.entities   = entities;
v.prototypes = prototypes;

// A relation is referenced by IDENTITY, not embedded by value. The non-id arm is
// a structurally-opaque object (additionalProperties, no declared body), so cast()'s
// Convert has nothing to descend into — entities pass through whole and their
// MikroORM Collections (symbols/uses) are never mauled. `schema` documents intent.
v.rel     = (schema) => v.union([scalars.ID, v.object({}, { additionalProperties: true })]);
v.literal = entityFactory(entities.LiteralDescriptor, entities.DataEntitySchema);
v.symbol  = entityFactory(entities.SymbolDescriptor,  entities.DataEntitySchema);
v.buffer  = entityFactory(entities.BufferDescriptor,  entities.DataEntitySchema);
v.bundle  = () => v.object({ entry: v.string().optional(), url: v.string().optional() });
v.mode    = entityFactory(entities.ModeDescriptor,    entities.DataEntitySchema);
v.intent  = entityFactory(entities.IntentDescriptor,  entities.DataEntitySchema);
v.thread  = entityFactory(entities.ThreadDescriptor,  entities.DataEntitySchema);
v.user    = entityFactory(entities.UserDescriptor,    entities.DataEntitySchema);

export { v };
