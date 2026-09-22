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
    mountpoint: Mountpoint.desc('Where the db and its migrations live. Declared wins; otherwise the mounting\'s seat. Example: "/viva/lighthouse"').optional(),
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
    mount: Path().desc('The mode\'s path under its daemon. Declared wins; otherwise /mode/<type>/<slug>. Example: "/mode/game/board"').optional(),
    url: Url().desc("Where a consumer reaches the mode: the daemon's url + mount. Example: https://runtime.vivalence.com/daemon/chess/mode/game/board").optional(),
    bundles: Mountpoint.desc('Where its compiled views live. Declared wins; otherwise <daemon mountpoint>/bundles/<type>/<slug>. Example: "/viva/instances/chess/mountpoint/daemon_chess/bundles/game/board"').optional(),
  },
  { additionalProperties: true },
);

export const Module = v.object({ manifest: Manifest }, { additionalProperties: true });

export const Kernel = v.array(v.union([v.string(), Mode, Module]));

export const Runtime = v.object(
  {
    manifest: v.object({ slug: Slug }, { additionalProperties: true }),
    statics: Statics({
      serve: Url().desc("Where this runtime BINDS. Example: http://0.0.0.0:2501"),
      remote: Url().desc("Where a consumer REACHES this runtime; daemons announce under it. Example: https://runtime.vivalence.com/").optional(),
    }),
  },
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
    mountpoint: Mountpoint.desc('Where the service persists. Declared wins; otherwise <mountpoint scope>/service_<slug>. Example: "/viva/lighthouse"'),
    statics: Statics().default({}),
    mount: Path().desc('Where the runtime attaches the service: /attached/process/service/<type>/<slug>, the folded manifest after the static segment. Example: "/attached/process/service/lighthouse/multiplayer"').optional(),
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
    mount: Path().desc('The daemon\'s path under the runtime. Declared wins; otherwise /daemon/<slug>. Example: "/daemon/chess"').optional(),
    url: Url().desc("Where a consumer reaches the daemon: runtime.statics.remote + mount. Example: https://runtime.vivalence.com/daemon/chess").optional(),
    attach: Url().desc("Where the runtime serves this daemon's bundles and cargo: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
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

// a ledger's word: what every instance on it inherits, slot by slot, unless it declares the slot
// itself. no daemons — a daemon is what an instance IS. services are declared seatless here and
// seated per instance by resolve.mountpoints, so this shape is FOLDED into an Instance, never cast
// on its own. the slot list paladin folds is Object.keys(Ledger.properties) minus manifest.
export const Ledger = v.object(
  {
    manifest: Manifest,
    environment: v.object({}, { additionalProperties: true }).optional(),
    runtime: Runtime.optional(),
    lighthouse: Lighthouse.optional(),
    datamap: Datamap.optional(),
    hallucinators: v.array(Mask).optional(),
    clients: v.array(Client).optional(),
    services: v.array(Service).optional(),
  },
  { additionalProperties: true },
);

export const Requirement = v.object({
  at: v.string(),
  read: v.array(v.string()),
  unset: v.array(v.string()),
});
