import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";
import { Daemon, Service, ModuleSpec } from "./circuitry.js";

export const Runtime = v.object(
  {
    slug: Slug,
    traits: v.array(v.string()).optional(),
    statics: v.record(v.string(), v.unknown()).optional(),
    datamap: ModuleSpec.optional(),
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
