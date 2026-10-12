import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";
import { Home } from "./home.js";
import { Path, Url } from "../prototypes/signatures.js";

const Statics = (known = {}) => v.object(known, { additionalProperties: true });
const Secrets = v.record(v.string(), v.unknown());

export const Mountpoint = Path({ pattern: "^/.*$", title: "an absolute path" }).$id("Mountpoint");

export const Mask = v.object(
  { module: v.string(), statics: Statics().optional(), secrets: Secrets.optional() },
  { additionalProperties: true },
);

export const Datamap = v.object(
  {
    module: v.string(),
    statics: Statics({ db: v.object({ file: v.string() }).optional() }).default({}),
    mountpoint: Mountpoint.desc('Where the db and its migrations live. Declared wins; otherwise one under its parent\'s mountpoint. Example: "/viva/lighthouse"').optional(),
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
    reference: Path().desc('The mode\'s path under its daemon. Declared wins; otherwise /mode/<type>/<slug>. Example: "/mode/game/board"').optional(),
    url: Url().desc("Where a consumer reaches the mode: the daemon's url + reference. Example: https://runtime.vivalence.com/daemon/chess/mode/game/board").optional(),
    bundles: Mountpoint.desc('Where its compiled views live. Declared wins; otherwise <daemon mountpoint>/bundles/<type>/<slug>. Example: "/viva/instances/chess/mountpoint/daemon_chess/bundles/game/board"').optional(),
  },
  { additionalProperties: true },
);

export const Modes = v.array(v.union([v.string(), Mode]));

export const Runtime = v.object(
  {
    manifest: v.object({ slug: Slug }, { additionalProperties: true }).default({ slug: "runtime" }),
    statics: Statics({
      serve: Url().desc("Where this runtime BINDS. Example: http://0.0.0.0:2501"),
      remote: Url().desc("Where a consumer REACHES this runtime; daemons announce under it. Example: https://runtime.vivalence.com/").optional(),
    }),
    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("The lighthouse slot's secret until every recipe says lighthouse; paladin folds it there. Example: a 32-char base64 string from openssl rand -base64 24") }).optional(),
    mountpoint: Mountpoint.desc('Where the runtime\'s own modes persist. Declared wins; otherwise the scope mountpoint. Example: "/viva/instances/chess/mountpoint"').optional(),
    reference: Path().desc('The runtime\'s reference as a host, /runtime/<slug>; paladin writes it. Example: "/runtime/runtime"').optional(),
    url: Url().desc("Where a consumer reaches the runtime host: statics.remote + reference. Example: https://runtime.vivalence.com/runtime/runtime").optional(),
    attach: Url().desc("Where the runtime serves its own bundles and cargo: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
    modes: Modes.optional(),
  },
  { additionalProperties: true },
);

export const LighthouseTraitsEnum = ["JOINABLE", "INVITATIONAL", "AUTOLOGIN"];
export const LighthouseTrait = v.object(
  {
    AUTOLOGIN: v.object(
      {
        username: v.string({ minLength: 1 }).default("localhost").optional().desc('The user every visitor becomes; minted on lighthouse boot. Example: "localhost"'),
        password: v.string({ minLength: 8 }).desc('Lets /login reach that user by hand too. Example: "${SECRET_VIVA_AUTOLOGIN}"').optional(),
      },
      { additionalProperties: false },
    ).default({}).optional(),
  },
  { additionalProperties: false },
);
export const Lighthouse = v.object(
  {
    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("Signs every user's tokens. Example: a 32-char base64 string from openssl rand -base64 24") }),
    traits: v.array(v.enum(LighthouseTraitsEnum)).default([]).desc('Which routes the lighthouse grafts. JOINABLE: /signup. INVITATIONAL: /signup takes an invite token. AUTOLOGIN: /autologin enters as trait.AUTOLOGIN.username. Example: ["JOINABLE"]'),
    trait: LighthouseTrait.default({}).optional().desc('Config per trait. Example: { "AUTOLOGIN": { "username": "localhost" } }'),
  },
  { additionalProperties: false },
);

export const ClientTrait = v.object({ HOME: Home.optional() }, { additionalProperties: false });
export const Client = v.object(
  {
    manifest: Manifest,
    module: v.string().optional(),
    statics: Statics({ serve: Url().optional() }).default({}),
    mountpoint: Mountpoint.desc('Where the client\'s own modes persist. Declared wins; otherwise <mountpoint scope>/client_<slug>. Example: "/viva/instances/chess/mountpoint/client_ghost"').optional(),
    reference: Path().desc('The client\'s reference as a host, /client/<slug>; paladin writes it. Example: "/client/ghost"').optional(),
    modes: Modes.optional(),
    trait: ClientTrait.default({}).optional().desc('Config per trait the MANIFEST declares — manifest.traits names them, as a mode\'s and the lighthouse\'s do. HOME: a terminal with no thread sits in trait.HOME.reference, unless its user carries a HOME. Example: { "HOME": { "reference": "/runtime/runtime/mode/harness/runtime" } }'),
  },
  { additionalProperties: true },
);

export const Service = v.object(
  {
    manifest: Manifest,
    module: v.string(),
    mountpoint: Mountpoint.desc('Where the service persists. Declared wins; otherwise <mountpoint scope>/service_<slug>. Example: "/viva/lighthouse"'),
    statics: Statics().default({}),
    reference: Path().desc('Where the runtime attaches the service: /attached/process/service/<type>/<slug>, the folded manifest after the static segment. Example: "/attached/process/service/lighthouse/multiplayer"').optional(),
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
    reference: Path().desc('The daemon\'s path under the runtime. Declared wins; otherwise /daemon/<slug>. Example: "/daemon/chess"').optional(),
    url: Url().desc("Where a consumer reaches the daemon: runtime.statics.remote + reference. Example: https://runtime.vivalence.com/daemon/chess").optional(),
    attach: Url().desc("Where the runtime serves this daemon's bundles and cargo: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
    modes: Modes.default([]),
    consume: v.record(v.string(), Mask).default({}),
    hallucinators: v.array(Mask).default([]),
  },
  { additionalProperties: true },
);

export const Instance = v.object(
  {
    manifest: Manifest,
    environment: v.object({}, { additionalProperties: true }),
    runtime: Runtime.optional(),
    lighthouse: Lighthouse.optional(),
    clients: v.array(Client).default([]),
    datamap: Datamap.optional(),
    hallucinators: v.array(Mask).optional(),
    services: v.array(Service).default([]),
    daemons: v.array(Daemon).default([]),
  },
  { additionalProperties: true },
);

const Reference = (prefix) => v.string({ pattern: `^\\$\\{${prefix}[A-Z0-9_]+\\}$`, title: `a "\${${prefix}…}" reference to an env key` });
const MaskStatics = v.object({}, { additionalProperties: true });
const MaskSecrets = v.record(v.string(), Reference("SECRET_"));
const MaskOf = v.object({ module: v.string(), statics: MaskStatics.optional(), secrets: MaskSecrets.optional() }, { additionalProperties: true });
const ModeMask = v.object(
  {
    module: v.string(),
    manifest: v.object({}, { additionalProperties: true }).optional(),
    mountpoint: v.union([v.string(), v.null()]).optional(),
    statics: MaskStatics.optional(),
    secrets: MaskSecrets.optional(),
  },
  { additionalProperties: false },
);
const Environment = v.object(
  {
    type: v.const("object"),
    properties: v.record(v.string(), v.object({}, { additionalProperties: true })),
    required: v.array(v.string()).optional(),
    additionalProperties: v.boolean().optional(),
  },
  { additionalProperties: false },
);

export const DaemonMask = v.object(
  {
    manifest: Manifest,
    mountpoint: v.string().optional(),
    statics: MaskStatics.optional(),
    reference: v.string().optional(),
    modes: v.array(v.union([v.string(), ModeMask])).optional(),
    consume: v.record(v.string(), MaskOf).optional(),
    hallucinators: v.array(MaskOf).optional(),
  },
  { additionalProperties: false },
);

export const InstanceMask = v.object(
  {
    manifest: Manifest,
    environment: Environment.optional(),
    runtime: v.object(
      { manifest: v.object({ slug: Slug }, { additionalProperties: true }).optional(), statics: MaskStatics.optional(), secrets: v.object({ jwt: Reference("SECRET_") }).optional(), modes: v.array(v.union([v.string(), ModeMask])).optional() },
      { additionalProperties: false },
    ).optional(),
    lighthouse: v.object({ secrets: v.object({ jwt: Reference("SECRET_") }), traits: v.array(v.enum(LighthouseTraitsEnum)).optional(), trait: LighthouseTrait.optional() }, { additionalProperties: false }).optional(),
    datamap: MaskOf.optional(),
    hallucinators: v.array(MaskOf).optional(),
    clients: v.array(v.object({ manifest: Manifest, module: v.string().optional(), mountpoint: v.string().optional(), statics: MaskStatics.optional(), modes: v.array(v.union([v.string(), ModeMask])).optional(), trait: ClientTrait.optional() }, { additionalProperties: false })).optional(),
    services: v.array(v.object({ manifest: Manifest, module: v.string(), mountpoint: v.string().optional(), statics: MaskStatics.optional(), secrets: MaskSecrets.optional(), datamap: MaskOf.optional() }, { additionalProperties: false })).optional(),
    daemons: v.array(DaemonMask).optional(),
  },
  { additionalProperties: false },
);

// a ledger's word: what every instance on it inherits, slot by slot, unless it declares the slot
// itself. no daemons — a daemon is what an instance IS. services are declared seatless here and
// placed per instance by resolve.mountpoints, so this shape is FOLDED into an Instance, never cast
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

export const Tapped = v.record(
  v.string(),
  v.object(
    {
      slug: Slug.desc("The package's slug — key, package and slug name it whole: @chess/package/chess. Example: chess"),
      mount: v.string().desc("Where the package lives — relative to the record file, or absolute. Example: ./registry/chess"),
      remote: v.string().desc("The git remote tap cloned it from. Example: git@github.com:vivalence/registry-chess.git").optional(),
    },
    { additionalProperties: false },
  ),
).desc("The registry record — one row per tapped package, keyed by its owner");

export const Requirement = v.object({
  at: v.string(),
  read: v.array(v.string()),
  unset: v.array(v.string()),
});
