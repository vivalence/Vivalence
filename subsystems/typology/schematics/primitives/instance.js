import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";
import { Url } from "../prototypes/signatures.js";

const statics = (known) => v.object(known, { additionalProperties: true });

// mask — declaration of "turn this into an instance": module ref + config.
export const Mask = v.object(
  {
    module: v.string(),
    statics: v.record(v.string(), v.unknown()).optional(),
    secrets: v.record(v.string(), v.unknown()).optional(),
  },
  { additionalProperties: true },
);

export const Lighthouse = v.object(
  {
    module: v.string(),
    statics: statics({ remote: Url() }),
    secrets: v.record(v.string(), v.unknown()).optional(),
  },
  { additionalProperties: true },
);

export const Daemon = v.object(
  {
    manifest: Manifest,
    statics: v.record(v.string(), v.unknown()).default({}),
    kernel: v.array(v.union([v.string(), v.object({}, { additionalProperties: true })])).default([]),
    consume: v.record(v.string(), Mask).default({}),
    lighthouse: Lighthouse.optional(),
    datamap: Mask,
    hallucinators: v.array(Mask).default([]),
  },
  { additionalProperties: true },
);

export const Service = v.object(
  {
    slug: Slug,
    module: v.string(),
    statics: statics({ serve: Url().optional() }).optional(),
    secrets: v.record(v.string(), v.unknown()).optional(),
    datamap: Mask.optional(),
  },
  { additionalProperties: true },
);

export const Runtime = v.object(
  {
    slug: Slug,
    traits: v.array(v.string()).optional(),
    statics: statics({ serve: Url() }),
    datamap: Mask.optional(),
  },
  { additionalProperties: true },
);

export const Client = v.object(
  {
    slug: Slug.optional(),
    module: v.string().optional(),
    statics: statics({ serve: Url().optional() }).optional(),
  },
  { additionalProperties: true },
);

export const Instance = v.object(
  {
    manifest: Manifest,
    runtime: Runtime.optional(),
    lighthouse: Lighthouse.optional(),
    clients: v.record(v.string(), Client).default({}),
    services: v.array(Service).default([]),
    daemons: v.array(Daemon).default([]),
  },
  { additionalProperties: true },
);
