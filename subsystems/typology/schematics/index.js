import { v as base, entityFactory } from "./v.js";
import * as scalars from "./scalars/index.js";
import * as primitives from "./primitives/index.js";
import * as entities from "./entities/index.js";
import * as prototypes from "./prototypes/index.js";

export const v = Object.assign(base, {
  scalars,
  slug: scalars.slug,
  url: scalars.url,
  mime: scalars.mime.type,
  primitives,
  environment: primitives.environment,
  entities,
  prototypes,

  // A relation is referenced by IDENTITY, not embedded by value. The non-id arm is
  // a structurally-opaque object (additionalProperties, no declared body), so cast()'s
  // Convert has nothing to descend into — entities pass through whole and their
  // MikroORM Collections (symbols/uses) are never mauled. `schema` documents intent.
  rel: (schema) => v.union([scalars.ID, v.object({}, { additionalProperties: true })]),
  literal: entityFactory(entities.LiteralDescriptor, entities.DataEntitySchema),
  symbol: entityFactory(entities.SymbolDescriptor, entities.DataEntitySchema),
  buffer: entityFactory(entities.BufferDescriptor, entities.DataEntitySchema),
  bundle: prototypes.Bundle,
  mode: entityFactory(entities.ModeDescriptor, entities.DataEntitySchema),
  intent: entityFactory(entities.IntentDescriptor, entities.DataEntitySchema),
  thread: entityFactory(entities.ThreadDescriptor, entities.DataEntitySchema),
  user: entityFactory(entities.UserDescriptor, entities.DataEntitySchema),
});
export { mime } from "./scalars/index.js";
export * as contexts from "./primitives/contexts.js";
