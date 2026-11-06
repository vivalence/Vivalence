import { v as base, entityFactory } from "./v.js";
import * as scalars from "./scalars/index.js";
import * as primitives from "./primitives/index.js";
import * as entities from "./entities/index.js";
import * as prototypes from "./prototypes/index.js";
import * as traits from "./traits/index.js";

export const v = Object.assign(base, {
  scalars,
  slug: scalars.slug,
  url: scalars.url,
  mime: scalars.mime.type,
  primitives,
  environment: primitives.environment,
  entities,
  prototypes,
  traits,

  // A relation is referenced by IDENTITY, not embedded by value. The non-id arm is
  // a structurally-opaque object (additionalProperties, no declared body), so cast()'s
  // Convert has nothing to descend into — entities pass through whole and their
  // MikroORM Collections (symbols/uses) are never mauled. `schema` documents intent.
  rel: (schema) => v.union([scalars.ID, v.object({}, { additionalProperties: true })]),
  literal: entityFactory(entities.LiteralSchematic),
  symbol: entityFactory(entities.SymbolSchematic),
  buffer: entityFactory(entities.BufferSchematic),
  bundle: prototypes.Bundle,
  mode: entityFactory(entities.ModeSchematic),
  intent: entityFactory(entities.IntentSchematic),
  thread: entityFactory(entities.ThreadSchematic),
  turn: entityFactory(entities.TurnSchematic),
  view: entityFactory(entities.ViewSchematic),
  file: entityFactory(entities.FileSchematic),
  user: entityFactory(entities.UserSchematic),
  note: entityFactory(entities.NoteSchematic),
  daemon: entityFactory(entities.DaemonSchematic),
  terminal: entityFactory(entities.TerminalSchematic),
  activity: entityFactory(entities.ActivitySchematic),
});
export { mime } from "./scalars/index.js";
export * as contexts from "./primitives/contexts.js";
