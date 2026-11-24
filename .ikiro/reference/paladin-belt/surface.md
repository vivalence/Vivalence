# paladin — belt and prototypes, the surface as it stands (11-26)

Read whole: `subsystems/paladin/gestalten/belt/*.js` · `prototypes/*.js` · `ledger/*.js` ·
`paladin/{prototype,lifecycle}.js` · `instance/{prototype,factory}.js` · `typology.js` · `mod*.js`.
Not read: `instance/lifecycle/*` · `gestalten/tools/*` · `gestalten/commands/*`.

Notation is mine, not an API: `fn(args) → out` inside a `v.object`. `PathLike = Path | string`.
`readers` = files matching `paladin.<member>` outside `bak` `testament` `.ikiro` `node_modules`.
`client` = installed by `mod.client.js` too. `find.viva` matches `.viva.{js,ts,md,org,json,jsonc}`;
`find.recipe` matches `instance.viva.json[c]`.

## how a belt member lands

```ts
// subsystems/paladin/paladin/lifecycle.js:7
belt(paladin, installs)            // for (install of installs) install(paladin)
// subsystems/paladin/mod.js          → lifecycle.belt(paladin, FULL)
// subsystems/paladin/mod.client.js   → lifecycle.belt(paladin, [vault, is, control])
FULL = [read, find, prime, check, state, envfile, is, scope, publish, source, clone, bundler,
        expand, vault, stamp, control, watch]
```

- An installer is `(paladin) => { paladin.<member> = … }`. `find` and `check` name it `config`.
- Order matters once: `find` evaluates `config.read.file` at install. `read` sits before it.
- In the folder, not installers: `faculties.js` (`extend`) · `ignore.js` (`IGNORE`, `skip`).
- In the folder, not in the index: `scribe.js` (sets `paladin.scribe = {}`).

## Paladin — what the belt hangs on

```ts
// subsystems/paladin/paladin/prototype.js
const Paladin = v.object({
  traits: v.array(),                       // [] — no reader seen
  mounts: v.environment({                  // MOUNTS, schema only
    VIVA_LEDGER_MOUNT, VIVA_REPOSITORY_MOUNT, VIVA_REGISTRY_MOUNT,
    VIVA_INSTANCE_MOUNT, VIVA_MOUNTPOINT_MOUNT,
  }),
  files: v.environment({ VIVA_CLIENT_GHOST_CREDENTIALS_FILE }),   // FILES, schema only
  env: Env,                                // typology Env over STRATA
  secret: Env,                             // same strata; lifecycle.secure deletes it
  ledger: Ledger,
  telemetry: Telemetry,
  role: v.string(),                        // getter: env VIVA_SYSTEM_ROLE
  mode: v.string(),                        // getter: env VIVA_SYSTEM_MODE
  split:   fn(bag) → { held, secrets, ignored, blank },
  assign:  fn(bag, stratum) → Split,
  observe: fn(bag, stratum, source) → Split,
  claim:   fn(bag, stratum, source) → Split,
  // set outside the class
  instance: Instance,                      // lifecycle.instance · lifecycle.baked
  version: v.string(),                     // lifecycle.version · lifecycle.baked
  tools: { fs, shell },                    // mod.js
  commands: Vector,                        // mod.js · ghost grafts it
});
const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];
// key law: SECRET_* → secret · VIVA_* | PUBLIC_VIVA_* → env · "" → blank · else ignored
```

## belt

```ts
// subsystems/paladin/gestalten/belt/read.js        readers 39 · needs: expand
const read = v.object({
  text:        fn(path: PathLike) → Promise<string>,                       // 14
  bytes:       fn(path: PathLike) → Promise<Uint8Array>,                   // 12
  json:        fn(path: PathLike, fallback?) → Promise<unknown>,           // 30 · jsonc
  jsonl:       fn(path: PathLike, fallback?) → Promise<unknown[]>,         // 2
  module:      fn(path: PathLike) → Promise<Namespace | unknown>,          // 1 · .json → json
  data:        fn(path: PathLike) → Promise<unknown>,                      // 0 · default ?? ns
  viva:        fn(path: PathLike) → Promise<VivaModule>,                   // 2 · cast.viva
  frontmatter: fn(path: PathLike) → Promise<{ attrs, body }>,              // 4
  file:        fn(path: PathLike) → Promise<unknown>,                      // 0 · by extension
  locate:      fn(source: PathLike, value, at: string)
                 → { held, from } | { path: Path, from },                  // 1 · expands ${}
  part:        fn(source: PathLike, value, at: string)
                 → Promise<{ module } | unknown>,                          // 2 · "@x"|inline|file
});

// subsystems/paladin/gestalten/belt/state.js       readers 29 · needs: itself
const state = v.object({
  dir:    fn(path) → Promise<void>,                                        // 6 · ensureDir
  text:   fn(path, text: string) → Promise<void>,                          // 6
  json:   fn(path, data) → Promise<void>,                                  // 7 · indent 2
  jsonl:  fn(path, entry) → Promise<void>,                                 // 4 · append
  env:    fn(path, bag: Record<string, string>) → Promise<string>,         // 17 · upsert by key
  line:   fn(key: string, value) → string,                                 // 5 · pure
  remove: fn(path) → Promise<void>,                                        // 5 · swallows
  scribe: fn(path, text: string) → Promise<boolean>,                       // 9 · tmp+rename
  store:  fn(path, bytes: Uint8Array) → Promise<boolean>,                  // 9 · tmp+rename
  land:   fn(path, dropped: { path, mime }, body: ReadableStream)
            → Promise<{ path, mount, mime, hash, bytes }>,                 // 3 · name.<hash8>.<ext>
  open:   fn(path) → Promise<Deno.FsFile>,                                 // 1 · append handle
});
// path here: Path | string | () => string. Every writer makes the parent first.
// scribe · store return false when the held content is equal.
// land throws when dropped.path leaves the root; a partial is removed in finally.

// subsystems/paladin/gestalten/belt/find.js        readers 16 · needs: read, ignore
const find = v.object({
  walk:     fn(pattern: RegExp | string, ignore?: string[])
              → fn(path: PathLike, depth = Infinity) → Promise<Path[]>,    // 6
  viva:     fn(path: PathLike, depth?) → Promise<Path[]>,                  // 3 · *.viva.<ext>
  json:     fn(path: PathLike, depth?) → Promise<Path[]>,                  // 0
  recipe:   fn(home: Path) → Path | null,                                  // 6 · sync
  describe: fn(root: string, path: string)
              → Promise<{ path, format, bytes, mtime } | null>,            // 3
  index:    fn(root: string, ignore?) → Promise<Described[]>,              // 4 · sorted by path
  data:     fn(path: PathLike, depth?) → Promise<unknown[]>,               // 5 · walk + read + flat
  type:     fn(path: PathLike, type: string, depth?)
              → Promise<(VivaModule & { source: Path })[]>,                // 2 · by manifest.type
  read:     fn(paths: PathLike[]) → Promise<unknown[]>,                    // 0 · map read.file
  skip:     fn(globs = IGNORE) → fn(name: string) → boolean,               // 1 · from ignore.js
});

// subsystems/paladin/gestalten/belt/check.js       readers 8 · needs: env, secret
const check = v.object({
  environment: fn(instance: Instance) → EnvRow[] & { fails: boolean },     // 6
  instance:    fn(instance: Instance) → Result,                            // 2
  env:         fn(keys: string | string[]) → Result,                       // 6
  path:        fn(paths: PathLike | PathLike[]) → Result,                  // 0 · statSync
  wrong:       ["UNDOCUMENTED", "REQUIRED", "INVALID"],                    // 4
});
const EnvRow = v.object({
  key, at, value, stratum, describe, group, required, reason,
  verdict: "ok" | "optional" | "documented" | "UNDOCUMENTED" | "REQUIRED" | "INVALID",
});
// Result = Issue[] & { fails: boolean, throw: fn(ErrorClass?) → void }
// Issue  = { type: "env" | "path" | "instance", key?, path?, message }
// environment reads instance.environment.properties and instance.paladin.requirements.
// instance reads instance.paladin.faults.

// subsystems/paladin/gestalten/belt/is.js          readers 14 · needs: role, mode · client
const is = v.object({          // every key a getter → boolean
  sudo, dev, prod, runtime, client, deployed, citizen, tty, browser, apple, veryimportant,
});
// citizen branches on `paladin.deployed`; no writer of that key in subsystems/paladin.

// subsystems/paladin/gestalten/belt/scope.js       readers 35 (scope) · 18 (scopes)
const scopes = fn(declarations: [name: string, condition: () => boolean, resolver: () => Path][])
const scope = Proxy<Record<string, Path | undefined>>   // get · has · ownKeys by condition
// declared in paladin/lifecycle.js scopes():
//   ledger · instance · mountpoint · repository · registry · credentials
// redeclaring "ledger" deletes paladin.ledger.held (the Registry).

// subsystems/paladin/gestalten/belt/source.js      readers 4 · needs: scope.repository
const source = fn(token: string | { source: string, file?: string }) → Path
// { file } → beside the declaring file · absolute → as is · ./ ../ → cwd · bare → repository

// subsystems/paladin/gestalten/belt/expand.js      readers 5 · needs: env, secret
const expand = fn(node, record?: Requirement[] | null, at = "") → node
// Requirement = { at: string, read: string[], unset: string[] }
// "${KEY}" whole → the value itself · inline → string · walks arrays and plain objects

// subsystems/paladin/gestalten/belt/publish.js     readers 4 · needs: env
const publish = fn() → void                 // every PUBLIC_* in env.vars → Deno.env.set

// subsystems/paladin/gestalten/belt/clone.js       readers 4
const clone = fn(remote: string, destination: PathLike) → Promise<Path>   // jj, then git
clone.remote = fn(source) → boolean                                        // 5 · https | git@ | ssh

// subsystems/paladin/gestalten/belt/envfile.js     readers 3 · needs: state.line
const envfile = v.object({
  MINTED:   { SECRET_VIVA_JWT: fn() → string },
  fallback: fn(held: Property) → string,                                   // 1 · held.default ?? ""
  mint:     fn(schema, bag = {}) → Record<string, string>,                 // 1
  scaffold: fn(schema) → string,                                           // 3 · grouped .env text
});

// subsystems/paladin/gestalten/belt/vault.js       readers 4 · needs: scope.credentials · client
const vault = v.object({
  held:  fn(origin: string) → Record | null,                               // 12 · sync
  store: fn(origin: string, record: Record | null) → void,                 // 9 · null removes
});
// backends: Deno → file at scope.credentials, mode 0600 · localStorage → `vault:<origin>`

// subsystems/paladin/gestalten/belt/stamp.js       readers 2 · needs: find.index
const stamp = v.object({
  tree: fn(root: string) → Promise<[path: string, digest: string][]>,      // 2
  fold: fn(marks: [string, string][]) → string,                            // 1 · pure
});

// subsystems/paladin/gestalten/belt/control.js     readers 4 · needs: is.browser, telemetry
//                                                   client
const control = fn(controller: Controller) → Controller
// pagehide | SIGINT SIGQUIT SIGTERM → controller.kill("SIGTERM", why); telemetry.follow

// subsystems/paladin/gestalten/belt/watch.js       readers 3
const watch = fn(path: PathLike, heard: fn(paths: string[]) → void) → fn() → void
// settles 200 ms; skips "access"; the return closes the watcher

// subsystems/paladin/gestalten/belt/prime.js       readers 3 · needs: find.walk, read.frontmatter
const prime = v.object({
  directory: fn(path: Path) → Promise<Vector>,                             // 2 · one route per .md
});

// subsystems/paladin/gestalten/belt/bundler.js     readers 12 · needs: scope.repository, is.prod,
//                                                   read.text, state.text, find.walk
const bundler = fn(directory: string, origin: string | null = null) → Bundler
bundler.members = fn() → Promise<{ imports: Record<string, string>, files: Record<string, string> }>
bundler.under   = fn(root: PathLike) → Promise<Bundler[]>
const Bundler = v.object({
  directory: v.string(),
  bundle:  fn({ mime, source?, entry?, mount?, name? })
             → Promise<Bundle | { bundle: Bundle, sources: Stamped[] }>,   // 2nd when mount
  fresh:   fn(sources: Stamped[]) → Promise<boolean>,
  serve:   fn(name: string) → Promise<{ text, type, integrity } | null>,
  inspect: fn(hash: string) → Promise<{ hash, source }>,
  prune:   fn({ dry = false }) → Promise<{ directory, kept, removed, bytes }>,
});
// Stamped = { path, bytes, mtime }
// compilers keyed by mime: dom.svelte · tty.solid · dom.solid · dom.html
// export MEMBERS: string[] — the shared client specifiers

// plain exports, no paladin
// subsystems/paladin/gestalten/belt/faculties.js
const extend = fn(below: HallucinatorMask[], above: HallucinatorMask[]) → HallucinatorMask[]
// subsystems/paladin/gestalten/belt/ignore.js
const IGNORE = ["bak", "archive", "slp", "node_modules", ".git", ".DS_Store", "*.bak", ".#*", "#*#"]
const skip = fn(globs = IGNORE) → fn(name: string) → boolean
```

## prototypes

```ts
// subsystems/paladin/ledger/prototype.js
const Ledger = v.object({
  paladin: Paladin,
  authored:  fn(source: Path) → unknown | null,                  // sync jsonc; absent → null
  record:    fn(slot: "instances" | "registry") → { path, held?, from?, fallback },
  instances: Instances,                                          // getter, new each access
  registry:  Registry,                                           // getter, held
  lock:      fn(instance: slug) → Lock,
  locks:     fn() → Promise<LockRecord[]>,
  log:       fn(instance: slug) → Log,
  recipe:    fn() → Promise<{ ...parts, manifest, source } | null>,   // cached per home
  processes: ["runtime", "anima"],                               // getter over CHILDREN
  specs:     fn(...processes: string[]) → Spec[],
  boot:      fn(specs: Spec[], { instance = null, attachment = "inherit" }) → Promise<Die>,
});
const Spec = v.object({
  identity: { process, mount },
  serve: v.string().nullable(),
  command: { bin, args, cwd, env },
});
// exports beside it: RECIPE = "ledger.viva.json" · RECORDS = ["instances", "registry"] · derive
// belt it calls: scope · read.locate · read.json · read.part · check.instance · publish

// subsystems/paladin/ledger/die.js — extends Wafer
const Die = v.object({
  manifest: { type: "instance", slug },                          // getter
  json: { pid, token, instance, status, processes, started },    // getter — the lock record
  populate, resolve, integrate, perpetuate, disintegrate,        // Wafer beats
  claim:   fn() → Promise<void>,                                 // lock.write(json), serialised
  release: fn() → Promise<void>,                                 // removes the lock it owns
});

// subsystems/paladin/prototypes/process.js — extends Wafer
const Process = v.object({
  in: Queue, out: Pipe,
  manifest: { type: "process", slug },                           // getter
  json: { process, pid, serve, status, exit },                   // getter
  populate, resolve, integrate, perpetuate, disintegrate,
});
// attachment: "inherit" | "piped" | "logged"
// logged opens ledger.log(instance).open(process, "out")

// subsystems/paladin/prototypes/instances.js
const Instances = v.object({
  // constructor(paladin, path, { held = null, from = null, fallback = true })
  all:     fn() → Promise<Record<slug, InstanceRecord>>,
  persist: fn(all) → Promise<void>,                              // throws when inline
  read:    fn(slug) → Promise<InstanceRecord | null>,
  shelf:   fn(slug) → Path,                                      // scope.ledger/instances/<slug>
  list:    fn() → Promise<({ slug } & InstanceRecord)[]>,
  write:   fn(slug, partial) → Promise<void>,                    // stamps createdAt · updatedAt
  lookup:  fn(mount: string) → Promise<({ slug } & InstanceRecord) | null>,
  resolve: fn(token: slug | path) → Promise<{ slug: string | null, mount, ... }>,
  rename:  fn(prior: slug, next: slug) → Promise<void>,
  remove:  fn(slug) → Promise<void>,
});
// InstanceRecord = { mount, createdAt, updatedAt } · export NOTHING (the sentence)
// belt it calls: read.json · state.json · scope.ledger · source

// subsystems/paladin/prototypes/registry.js
const Registry = v.object({
  // constructor(paladin, path, { held = null, from = null, fallback = true })
  pensieve: Pensieve, stale: v.array(v.string()), span: Span, integrity: Map<path, Set<string>>,
  // the record — { [owner]: { slug, mount, remote? } }, schematic instance.Tapped
  read:      fn() → Promise<Tapped | null>,
  write:     fn(record: Tapped) → Promise<void>,                 // throws when inline
  tapped:    fn() → Promise<Tapped>,
  has:       fn(owner) → Promise<boolean>,
  add:       fn(owner, entry) → Promise<Tapped>,
  remove:    fn(owner) → Promise<Tapped>,
  base:      v.string(),                                         // getter
  locate:    fn(root: string) → string,                          // absolute → ./relative
  resolve:   fn(mount: string) → Path,
  stored:    fn(location: string) → Path,                        // against scope.registry
  row:       fn({ owner, slug, root }) → [owner, { slug, mount }],
  discover:  fn(scope: Path) → Promise<{ owner, slug, root }[]>,
  seed:      fn(scope: Path) → Promise<Tapped>,
  reconcile: fn(checkout: Path, commons: Path) → Promise<{ record, stale } | null>,
  tap:       fn(source: string, target?: string) → Promise<owner>,
  untap:     fn(owner) → Promise<Tapped>,
  // the pensieve side
  mount:     fn(root: Path, claim?: { owner, slug }) → Promise<Registry>,
  supply:    fn() → Promise<Registry>,
  list:      fn(query = {}) → Module[],
  lookup:    fn(query) → Promise<Module>,
  assert:    fn(path: string, module) → module,                  // throws the recorded faults
  module:    fn(identifier: string) → Promise<Module>,
  accio:     fn(query: string | Mask) → Promise<Citizen>,
  wire:      fn(mask) → Promise<{ datamap?, hallucinators, consume, modes, dormant, domain }>,
  toJSON:    fn() → { record, pensieve },
});
// belt it calls: read.json · read.module · read.viva · state.json · find.type · find.viva ·
//                clone · clone.remote · scope.ledger · scope.registry · scope.repository

// subsystems/paladin/prototypes/pensieve.js — extends Map: owner → type → slug → version → module
const Pensieve = v.object({
  register: fn(module) → Pensieve,                               // throws on a second source
  revelio:  fn({ owner, type, slug, version? }) → Promise<Module | null>,   // a deep copy
  latest:   fn(slugMap: Map) → Module,
  byType:   fn(type: string) → Module[],
});

// subsystems/paladin/prototypes/manifest.js
const Manifest = v.object({ ...manifest, identifier: "<owner>/<type>/<slug>" })   // getter

// subsystems/paladin/prototypes/lock.js
const Lock = v.object({
  write:  fn(record) → Promise<void>,
  read:   fn() → Promise<LockRecord | null>,                     // removes a dead lock
  remove: fn() → Promise<void>,
});
// belt it calls: state.json · read.json · state.remove

// subsystems/paladin/prototypes/log.js
const Log = v.object({
  base:   Path,                                                  // scope.ledger/logs/<instance>
  append: fn(span: Span) → Promise<void>,                        // spans.jsonl
  open:   fn(process: string, stream: string) → Promise<Deno.FsFile>,
});
// belt it calls: scope.ledger · state.jsonl · state.open

// subsystems/paladin/prototypes/telemetry.js
const Telemetry = v.object({
  kept: {}, settles: {}, controller, attached, span, listening,
  logs:    Path,                                                 // getter: ledger.log(slug).base
  append:  fn(target: string, record) → Promise<void>,
  drain:   fn(target: string) → void,                            // localStorage
  keep:    fn(target: string, record) → void,
  console: fn(record) → Promise,                                 // getters, each a sink
  file:    fn(record) → Promise,
  socket:  fn(record) → Promise,
  follow:  fn(controller) → boolean | null,
  attach:  fn() → boolean | null,
  send:    fn(record) → void,
  listen:  fn(span: Span) → Span,
  accept:  fn(listener, span: Span) → Promise<void>,
  watch:   fn(logger, stopped: Promise) → Promise<void>,
});
// exports beside it: ranked · held · fill · faults · line
// belt it calls: state.jsonl · state.dir · is.browser

// subsystems/paladin/prototypes/integrity.js
const TRAITS: Record<TraitName, exportName | null>
const RULES: [applies: fn(module) → boolean, apply: fn(module, span) → module][]
const probe = fn(rules) → fn(module, span) → module

// subsystems/paladin/instance/prototype.js — interface extends primitives.instance.InstanceMask
const Instance = v.object({
  manifest, environment, runtime, lighthouse, datamap, clients, services, daemons, telemetry,
  paladin: { requirements: Requirement[], faults: string[], dormant: [], inherited: string[] },
  client: fn(slug) → ClientMask,                                 // throws when unmasked
});
```

## lifecycle and barrels

```ts
// subsystems/paladin/paladin/lifecycle.js
belt(paladin, installs) · env(paladin) · scopes(paladin) · version(paladin) · instance(paladin)
bake(paladin, slug) → baked data · baked(paladin, data) → Instance
statements(paladin)                      // state.dir over every mount
secure(paladin)                          // deletes paladin.secret

// subsystems/paladin/instance/factory.js — fn.memo keyed on paladin.instance
factory(paladin): population.environment → population.recipe → resolution.defaults →
                  resolution.mountpoints → integration.settle → telemetry.attach → publish

// subsystems/paladin/typology.js
Paladin · Pensieve · Manifest · Instance · *ledger/index.js · FULL · gestalten ·
factories { instance } · lifecycle { paladin, instance }
// subsystems/paladin/prototypes/index.js
Manifest · Pensieve · Registry · Process · Instances · NOTHING · Lock · Log · Telemetry ·
TRAITS · RULES · probe
```

## belt members a prototype calls

```jsonc
{
  "read.json":     ["Ledger", "Instances", "Registry", "Lock"],
  "read.locate":   ["Ledger"],
  "read.part":     ["Ledger"],
  "read.module":   ["Registry"],
  "read.viva":     ["Registry"],
  "state.json":    ["Instances", "Registry", "Lock"],
  "state.jsonl":   ["Log", "Telemetry"],
  "state.open":    ["Log"],
  "state.remove":  ["Lock"],
  "state.dir":     ["Telemetry"],
  "find.type":     ["Registry"],
  "find.viva":     ["Registry"],
  "clone":         ["Registry"],
  "source":        ["Instances"],
  "check.instance": ["Ledger"],
  "publish":       ["Ledger"],
  "is.browser":    ["Telemetry"],
  "scope":         ["Ledger", "Instances", "Registry", "Log"]
}
```
