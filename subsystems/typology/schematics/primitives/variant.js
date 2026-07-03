import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";

// mask — declaration of "turn this into an instance": module ref + config.
export const Mask = v.object(
  {
    module: v.string(),
    statics: v.record(v.string(), v.unknown()).optional(),
    secrets: v.record(v.string(), v.unknown()).optional(),
  },
  { additionalProperties: true },
);

export const Daemon = v.object(
  {
    manifest: Manifest,
    statics: v.record(v.string(), v.unknown()).default({}),
    kernel: v.array(v.string()).default([]),
    consume: v.record(v.string(), Mask).default({}),
    lighthouse: Mask,
    datamap: Mask,
    hallucinators: v.array(Mask).optional(),
  },
  { additionalProperties: true },
);

export const Service = v.object(
  {
    slug: Slug,
    module: v.string(),
    statics: v.record(v.string(), v.unknown()).optional(),
    secrets: v.record(v.string(), v.unknown()).optional(),
    datamap: Mask.optional(),
  },
  { additionalProperties: true },
);

export const Runtime = v.object(
  {
    slug: Slug,
    traits: v.array(v.string()).optional(),
    statics: v.record(v.string(), v.unknown()).optional(),
    datamap: Mask.optional(),
  },
  { additionalProperties: true },
);

export const Client = v.object(
  {
    slug: Slug.optional(),
    module: v.string().optional(),
    statics: v.record(v.string(), v.unknown()).optional(),
  },
  { additionalProperties: true },
);

export const Variant = v.object(
  {
    manifest: Manifest,
    path: v.string().optional(),
    runtime: Runtime.optional(),
    clients: v.record(v.string(), Client).optional(),
    services: v.array(Service).optional(),
    daemons: v.array(Daemon).optional(),
  },
  { additionalProperties: true },
);
