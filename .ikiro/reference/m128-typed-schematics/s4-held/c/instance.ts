import type { StaticDecode } from "typebox";
import { v } from "../v.js";
import { Slug } from "../scalars/index.js";
import { Manifest } from "./manifest.js";
import { Home } from "./home.js";
import { Track } from "./track.js";
import { Conversational, Docked, Harnessed, Themed } from "../traits/index.js";
import { overwrite } from "../traits/overwrite.js";
import { Tooled } from "../traits/tooled.js";
import { Primed } from "../traits/primed.js";
import { Path, Url } from "../prototypes/signatures.js";
import { FacultyMask, FacultyRecipe } from "./hallucination.js";

export const StaticsMask = v.object({}, { additionalProperties: true });
export const SecretsMask = v.record(v.string(), v.unknown());
export const EnvironmentMask = v.object({}, { additionalProperties: true });

export const Mountpoint = Path({ pattern: "^/.*$", title: "an absolute path" }).$id("Mountpoint");

export const Mask = v.object(
  { module: v.string(), statics: StaticsMask.optional(), secrets: SecretsMask.optional() },
  { additionalProperties: true },
);

export const HallucinatorMask = v.object(
  {
    module: v.string(),
    statics: StaticsMask.optional(),
    secrets: SecretsMask.optional(),
    faculties: v.array(FacultyMask),
  },
  { additionalProperties: true },
);

export const DatamapMask = v.object(
  {
    module: v.string(),
    statics: v.object({ db: v.object({ file: v.string() }).optional() }, { additionalProperties: true }).default({}),
    mountpoint: Mountpoint.desc('Where the db and its migrations live. Declared wins; otherwise one under its parent\'s mountpoint. Example: "/viva/lighthouse"').optional(),
  },
  { additionalProperties: true },
);

export const ModeMaskTrait = v.object(
  {
    HARNESSED: overwrite(Harnessed).optional(),
    CONVERSATIONAL: overwrite(Conversational).optional(),
    TOOLED: Tooled.optional(),
    PRIMED: Primed.optional(),
  },
  { additionalProperties: false },
);

export const ModeMask = v.object(
  {
    module: v.string(),
    traits: v.array(v.string()).default([]),
    trait: ModeMaskTrait.default({}).desc(
      "What a thread of this mode starts from, keyed by the thread's trait, in that trait's shape: " +
        "HARNESSED · CONVERSATIONAL · TOOLED · PRIMED. " +
        'Example: { "HARNESSED": { "tier": "fast", "rounds": 6 } }',
    ),
    mountpoint: v.union([Mountpoint, v.null()]).optional(),
    statics: StaticsMask.optional(),
    secrets: SecretsMask.optional(),
    consume: v.record(v.string(), Mask).default({}),
    hallucinators: v.array(HallucinatorMask).default([]),
    reference: Path().desc('The mode\'s path under its daemon. Declared wins; otherwise /mode/<type>/<slug>. Example: "/mode/game/board"').optional(),
    url: Url().desc("Where a consumer reaches the mode: the daemon's url + reference. Example: https://runtime.vivalence.com/daemon/chess/mode/game/board").optional(),
    bundles: Mountpoint.desc('Where its compiled views live. Declared wins; otherwise <daemon mountpoint>/bundles/<type>/<slug>. Example: "/viva/instances/chess/mountpoint/daemon_chess/bundles/game/board"').optional(),
  },
  { additionalProperties: true },
);

export const ModeMasks = v.array(v.union([v.string(), ModeMask]));

export const RuntimeMask = v.object(
  {
    manifest: v.object(
      { ...Manifest.properties, type: v.string().default("runtime"), slug: Slug.default("runtime") },
      { additionalProperties: true },
    ).default({}),
    statics: v.object({
      serve: Url().desc("Where this runtime BINDS. Example: http://0.0.0.0:2501"),
      remote: Url().desc("Where a consumer REACHES this runtime; daemons announce under it. Example: https://runtime.vivalence.com/").optional(),
    }, { additionalProperties: true }),
    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("The lighthouse slot's secret until every recipe says lighthouse; paladin folds it there. Example: a 32-char base64 string from openssl rand -base64 24") }).optional(),
    mountpoint: Mountpoint.desc('Where the runtime\'s own modes persist. Declared wins; otherwise the scope mountpoint. Example: "/viva/instances/chess/mountpoint"').optional(),
    reference: Path().desc('The runtime\'s reference as a host, /runtime/<slug>; paladin writes it. Example: "/runtime/runtime"').optional(),
    url: Url().desc("Where a consumer reaches the runtime host: statics.remote + reference. Example: https://runtime.vivalence.com/runtime/runtime").optional(),
    attach: Url().desc("Where the runtime serves views and files by row: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
    modes: ModeMasks.optional(),
    hallucinators: v.array(HallucinatorMask).default([]),
  },
  { additionalProperties: true },
);

export const LighthouseTraitsEnum = ["JOINABLE", "INVITATIONAL", "AUTOLOGIN", "AUTOSIGNUP"];
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
export const LighthouseMask = v.object(
  {
    secrets: v.object({ jwt: v.string({ minLength: 24 }).desc("Signs every user's tokens. Example: a 32-char base64 string from openssl rand -base64 24") }),
    traits: v.array(v.enum(LighthouseTraitsEnum)).default([]).desc('Which routes the lighthouse grafts. JOINABLE: /signup. INVITATIONAL: /signup takes an invite token. AUTOLOGIN: /autologin enters as trait.AUTOLOGIN.username. AUTOSIGNUP: /autosignup enters under the name the visitor types. Example: ["JOINABLE"]'),
    trait: LighthouseTrait.default({}).optional().desc('Config per trait. Example: { "AUTOLOGIN": { "username": "localhost" } }'),
  },
  { additionalProperties: false },
);

export const ClientTrait = v.object({ HOME: Home.optional(), DOCKED: Docked.optional(), THEMED: Themed.optional() }, { additionalProperties: false });
export const ClientMask = v.object(
  {
    manifest: Manifest,
    module: v.string().optional(),
    statics: v.object({ serve: Url().optional() }, { additionalProperties: true }).default({}),
    mountpoint: Mountpoint.desc('Where the client\'s own modes persist. Declared wins; otherwise <mountpoint scope>/client_<slug>. Example: "/viva/instances/chess/mountpoint/client_ghost"').optional(),
    reference: Path().desc('The client\'s reference as a host, /client/<slug>; paladin writes it. Example: "/client/ghost"').optional(),
    modes: ModeMasks.optional(),
    trait: ClientTrait.default({}).optional().desc('Config per trait the MANIFEST declares — manifest.traits names them, as a mode\'s and the lighthouse\'s do. HOME: a terminal with no thread sits in trait.HOME.reference, unless its user carries a HOME. Example: { "HOME": { "reference": "/runtime/runtime/mode/harness/runtime" } }'),
  },
  { additionalProperties: true },
);

export const ServiceMask = v.object(
  {
    manifest: Manifest,
    module: v.string(),
    mountpoint: Mountpoint.desc('Where the service persists. Declared wins; otherwise <mountpoint scope>/service_<slug>. Example: "/viva/lighthouse"'),
    statics: StaticsMask.default({}),
    reference: Path().desc('Where the runtime attaches the service: /attached/process/service/<type>/<slug>, the folded manifest after the static segment. Example: "/attached/process/service/lighthouse/multiplayer"').optional(),
    secrets: SecretsMask.optional(),
    hallucinators: v.array(HallucinatorMask).default([]),
    datamap: DatamapMask,
  },
  { additionalProperties: true },
);

export const DaemonMask = v.object(
  {
    manifest: Manifest,
    mountpoint: Mountpoint,
    statics: StaticsMask.default({}),
    reference: Path().desc('The daemon\'s path under the runtime. Declared wins; otherwise /daemon/<slug>. Example: "/daemon/chess"').optional(),
    url: Url().desc("Where a consumer reaches the daemon: runtime.statics.remote + reference. Example: https://runtime.vivalence.com/daemon/chess").optional(),
    attach: Url().desc("Where the runtime serves this daemon's views and files by row: remote + /attached. Example: https://runtime.vivalence.com/attached").optional(),
    modes: ModeMasks.default([]),
    consume: v.record(v.string(), Mask).default({}),
    hallucinators: v.array(HallucinatorMask).default([]),
  },
  { additionalProperties: true },
);

export const Sieve = v
  .record(v.string({ pattern: "^/" }), v.array(Track), { additionalProperties: false })
  .desc("Path → tracks admitted. Plain = exact · trailing /(.*) = below · most specific wins.")
  .example({ "/(.*)": ["status", "fault"] });

export const Telemetry = v.object(
  {
    logger: v
      .record(v.string(), Sieve)
      .desc('Target → sieve. "console" · "socket" · a .jsonl under the logs · :name filled by the sieve key.')
      .example({ "daemons/:daemon.jsonl": { "/runtime/runtime/daemon/:daemon/(.*)": ["fault"] } })
      .default({ console: { "/runtime/(.*)": ["status", "fault", "log"] } })
      .optional(),
  },
  { additionalProperties: false },
);

export const InstanceMask = v.object(
  {
    manifest: Manifest,
    environment: EnvironmentMask,
    runtime: RuntimeMask.optional(),
    lighthouse: LighthouseMask.optional(),
    clients: v.array(ClientMask).default([]),
    datamap: DatamapMask.optional(),
    services: v.array(ServiceMask).default([]),
    daemons: v.array(DaemonMask).default([]),
    telemetry: Telemetry.default({}),
  },
  { additionalProperties: true },
);
export type InstanceMask = StaticDecode<typeof InstanceMask>;

const Reference = (prefix) => v.string({ pattern: `^\\$\\{${prefix}[A-Z0-9_]+\\}$`, title: `a "\${${prefix}…}" reference to an env key` });
export const StaticsRecipe = v.object({}, { additionalProperties: true });
export const SecretsRecipe = v.record(v.string(), Reference("SECRET_"));

export const Recipe = v.object(
  { module: v.string(), statics: StaticsRecipe.optional(), secrets: SecretsRecipe.optional() },
  { additionalProperties: true },
);

export const HallucinatorRecipe = v.object(
  {
    module: v.string(),
    statics: StaticsRecipe.optional(),
    secrets: SecretsRecipe.optional(),
    faculties: v.array(FacultyRecipe),
  },
  { additionalProperties: true },
);

export const DatamapRecipe = v.object(
  { module: v.string(), statics: StaticsRecipe.optional(), secrets: SecretsRecipe.optional() },
  { additionalProperties: true },
);

export const ModeRecipeTrait = v.object(
  {
    HARNESSED: overwrite(Harnessed).optional(),
    CONVERSATIONAL: overwrite(Conversational).optional(),
    TOOLED: Tooled.optional(),
    PRIMED: Primed.optional(),
  },
  { additionalProperties: false },
);

export const ModeRecipe = v.object(
  {
    module: v.string(),
    traits: v.array(v.string()).optional(),
    trait: ModeRecipeTrait.optional(),
    mountpoint: v.union([v.string(), v.null()]).optional(),
    statics: StaticsRecipe.optional(),
    secrets: SecretsRecipe.optional(),
    consume: v.record(v.string(), Recipe).optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const ModeRecipes = v.array(v.union([v.string(), ModeRecipe]));

export const EnvironmentRecipe = v.object(
  {
    type: v.const("object"),
    properties: v.record(v.string(), v.object({}, { additionalProperties: true })),
    required: v.array(v.string()).optional(),
    additionalProperties: v.boolean().optional(),
  },
  { additionalProperties: false },
);

export const RuntimeRecipe = v.object(
  {
    manifest: v.object({ slug: Slug }, { additionalProperties: true }).optional(),
    statics: StaticsRecipe.optional(),
    secrets: v.object({ jwt: Reference("SECRET_") }).optional(),
    modes: ModeRecipes.optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const LighthouseRecipe = v.object(
  {
    secrets: v.object({ jwt: Reference("SECRET_") }),
    traits: v.array(v.enum(LighthouseTraitsEnum)).optional(),
    trait: LighthouseTrait.optional(),
  },
  { additionalProperties: false },
);

export const ClientRecipe = v.object(
  {
    manifest: Manifest,
    module: v.string().optional(),
    mountpoint: v.string().optional(),
    statics: StaticsRecipe.optional(),
    modes: ModeRecipes.optional(),
    trait: ClientTrait.optional(),
  },
  { additionalProperties: false },
);

export const ServiceRecipe = v.object(
  {
    manifest: Manifest,
    module: v.string(),
    mountpoint: v.string().optional(),
    statics: StaticsRecipe.optional(),
    secrets: SecretsRecipe.optional(),
    datamap: DatamapRecipe.optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const DaemonRecipe = v.object(
  {
    manifest: Manifest,
    mountpoint: v.string().optional(),
    statics: StaticsRecipe.optional(),
    reference: v.string().optional(),
    modes: ModeRecipes.optional(),
    consume: v.record(v.string(), Recipe).optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
  },
  { additionalProperties: false },
);

export const InstanceRecipe = v.object(
  {
    manifest: Manifest,
    environment: EnvironmentRecipe.optional(),
    runtime: RuntimeRecipe.optional(),
    lighthouse: LighthouseRecipe.optional(),
    datamap: DatamapRecipe.optional(),
    clients: v.array(ClientRecipe).optional(),
    services: v.array(ServiceRecipe).optional(),
    daemons: v.array(DaemonRecipe).optional(),
    telemetry: Telemetry.optional(),
  },
  { additionalProperties: false },
);

// a ledger's word: what every instance on it inherits, slot by slot, unless it declares the slot
// itself. no daemons — a daemon is what an instance IS. services are declared seatless here and
// placed per instance by resolve.mountpoints, so this shape is FOLDED into an Instance, never cast
// on its own. the slot list paladin folds is Object.keys(Ledger.properties) minus manifest.
export const LedgerRecipe = v.object(
  {
    manifest: Manifest,
    environment: EnvironmentRecipe.optional(),
    runtime: RuntimeRecipe.optional(),
    lighthouse: LighthouseRecipe.optional(),
    datamap: DatamapRecipe.optional(),
    hallucinators: v.array(HallucinatorRecipe).optional(),
    clients: v.array(ClientRecipe).optional(),
    services: v.array(ServiceRecipe).optional(),
    telemetry: Telemetry.optional(),
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
export type Requirement = StaticDecode<typeof Requirement>;
