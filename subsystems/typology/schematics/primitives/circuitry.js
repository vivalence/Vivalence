import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";

export const ModuleSpec = v.object(
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
    statics: v.record(v.string(), v.unknown()).optional(),
    kernel: v.array(v.string()).optional(),
    modes: v.array(v.string()).optional(),
    lighthouse: ModuleSpec.optional(),
    datamap: ModuleSpec.optional(),
    hallucinators: v.array(ModuleSpec).optional(),
    consume: v.record(v.string(), ModuleSpec).optional(),
  },
  { additionalProperties: true },
);

export const Service = v.object(
  {
    slug: Slug,
    module: v.string(),
    statics: v.record(v.string(), v.unknown()).optional(),
    secrets: v.record(v.string(), v.unknown()).optional(),
    datamap: ModuleSpec.optional(),
  },
  { additionalProperties: true },
);
