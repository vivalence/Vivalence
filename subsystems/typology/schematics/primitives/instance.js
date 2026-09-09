import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";
import { Path, Url } from "../prototypes/signatures.js";

const Statics = (known = {}) => v.object(known, { additionalProperties: true });
const Secrets = v.record(v.string(), v.unknown());

export const Mountpoint = Path({ pattern: "^/.*$", title: "an absolute path" }).$id("Mountpoint");

export const Mask = v.object(
  { module: v.string(), statics: Statics().optional(), secrets: Secrets.optional() },
  { additionalProperties: true },
);

export const Lighthouse = v.object(
  { module: v.string(), statics: Statics({ remote: Url() }), secrets: Secrets.optional() },
  { additionalProperties: true },
);

export const Datamap = v.object(
  {
    module: v.string(),
    statics: Statics({ db: v.object({ file: v.string() }).optional() }).default({}),
    mountpoint: Mountpoint.optional(),
  },
  { additionalProperties: true },
);

export const Mode = v.object(
  {
    module: v.string(),
    manifest: v.object({}, { additionalProperties: true }).optional(),
    mountpoint: v.union([Mountpoint, v.null()]).optional(),
    statics: Statics().optional(),
    secrets: Secrets.optional(),
  },
  { additionalProperties: true },
);

export const Module = v.object({ manifest: Manifest }, { additionalProperties: true });

export const Kernel = v.array(v.union([v.string(), Mode, Module]));

export const Runtime = v.object(
  { manifest: v.object({ slug: Slug }, { additionalProperties: true }), statics: Statics({ serve: Url() }) },
  { additionalProperties: true },
);

export const Client = v.object(
  {
    manifest: Manifest,
    module: v.string().optional(),
    statics: Statics({ serve: Url().optional() }).default({}),
  },
  { additionalProperties: true },
);

export const Service = v.object(
  {
    manifest: Manifest,
    module: v.string(),
    mountpoint: Mountpoint,
    statics: Statics({ serve: Url().optional() }).default({}),
    secrets: Secrets.optional(),
    datamap: Datamap,
  },
  { additionalProperties: true },
);

export const Daemon = v.object(
  {
    manifest: Manifest,
    mountpoint: Mountpoint,
    statics: Statics().default({}),
    kernel: Kernel.default([]),
    consume: v.record(v.string(), Mask).default({}),
    lighthouse: Lighthouse,
    datamap: Datamap,
    hallucinators: v.array(Mask).default([]),
  },
  { additionalProperties: true },
);

export const Instance = v.object(
  {
    manifest: Manifest,
    environment: v.object({}, { additionalProperties: true }),
    runtime: Runtime.optional(),
    clients: v.array(Client).default([]),
    lighthouse: Lighthouse.optional(),
    datamap: Datamap.optional(),
    hallucinators: v.array(Mask).optional(),
    services: v.array(Service).default([]),
    daemons: v.array(Daemon).default([]),
  },
  { additionalProperties: true },
);

export const Requirement = v.object({
  at: v.string(),
  read: v.array(v.string()),
  unset: v.array(v.string()),
});
