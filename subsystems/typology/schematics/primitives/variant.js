import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";

// rename to either mode or spec or maybe scope all of them under spec? or maybe i called it cake? some coherent name. spec makes most sense honestly.
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
    statics: v.record(v.string(), v.unknown()).default({}),
    kernel: v.array(v.string()).default([]),
    modes: v.array(v.string()).default([]),
    consume: v.record(v.string(), ModuleSpec).default({}),
    lighthouse: ModuleSpec,
    datamap: ModuleSpec,
    hallucinators: v.array(ModuleSpec).optional(),
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
