<!-- writer: agent · MANDATE: beef 09-01 — "i want you to maintain some significant ownership over the way the ledger works and with a solid meta on the subcomponents of this system, reaching up all the way into paladin. you need to understand and be able to control/interpret the ledger and you can assume ~/.viva as default here. let have it teach you." · derived-from: read-only expedition over ~/.viva + subsystems/paladin + systems/ghost, every claim cited · verified: ~/.viva tree walked, verbs traced to source, instance/doctor RUN on both instances, populate strata read POST-m55-abandoned-coherence-blast · limit: 110 lines -->
# ledger — the machine record at ~/.viva (paladin ⟶ ghost, whole spine)

⚠️ **Code-state is THREE layers right now** (stamped at the 09-01 expedition): HEAD `04e46f79d` predates the strata entirely; the m40/m41/m44-era shape is UNCOMMITTED (+2109/−297 across paladin+ghost); m55-abandoned-coherence stages I–II landed in the working tree DURING the survey. Line numbers below are post-blast reads and drift within hours — re-read before citing.

## anatomy (~/.viva, the default ledger)

```
instances.json      identity record {slug: {mount, createdAt, updatedAt}} — the intended SOLE identity (m44)
registry.json       tap record: refs, absolute or store-relative (resolve vs scope.registry, ledger/registry.js)
environment.json    ⚠️ NO LONGER READ by populate post-blast; instance/use --ledger STILL WRITES it (use.js:36) — transitional
.env                (does not exist yet) — the ledger stratum's new home, CLAIMED (populate.js:96-101)
locks/              <instance>_<process>.lock {pid,instance,process,mount,started}; auto-removed on exit
sessions/           <shell-pid>.json env bags (VIVA_INSTANCE_MOUNT) — pid-keyed via ghost.sh VIVA_PROCESS_ID=$PPID
logs/               <instance>/spans.jsonl (ledger/log.js)
instances/<slug>/   the shelf — instance marker *.viva.js · .env (authored) · mountpoint/{daemon,service}_<slug>
registry/           the package STORE (tapped clones; untap keeps the working copy)
~/.config/viva/env  sourced by ghost.sh — VIVA_REPOSITORY_MOUNT + VIVA_LEDGER_MOUNT exports
```

## the spine, bottom-up

- **strata** — `paladin.js:7` `STRATA = flag > cwd > instance > .env > os > session > ledger`; first-hit `Env.get` (typology `env.js:61-66`), `provenance`/`strati` beside it; `${VAR}` expansion lazy, within ONE bag — env never reaches into secret.
- **the ONE secrecy split** — `paladin.js:11-12`: `SECRET_*` → secret bag; `VIVA_*`/`PUBLIC_VIVA_*` → env; KEY decides, never filename or caller. Three ingresses `assign`/`observe`/`claim` → `{held, secrets, ignored}`. (Wrinkle: ghost `--env` predicate is narrower `SECRET_VIVA_*`, mod.js:146.)
- **stratum loads** (`lifecycle/populate.js`): os = Deno.env · cwd `.env` observed + `VIVA_ENV_FILE` claimed · instance = `Instance.mount()` → **`.env` at instance root and nothing else** (instance.js:162-167, environment.json branches DELETED) · session = `sessions/<pid>.json` through the split · ledger = `<ledger>/.env` claimed.
- **scope proxy** (`belt/scope.js`) — ledger (`VIVA_LEDGER_MOUNT` ?? `~/.viva`) · instance (**THROWS on slug-shaped mount**, populate.js:45-49) · mountpoint · repository · registry (?? `<ledger>/registry`).
- **hydrate = THE PINHOLE** (`prototypes/instance.js:43-67`): every declaration thunk fires exactly ONCE through a recording Proxy; DEFERRED (secrets) records the read but returns the thunk — a secret never materializes on the instance. `mount = fn.once` → environment → resolve → validate → `publish()` (only `PUBLIC_*` reach Deno.env).
- **paladin.ledger.*** (`prototypes/ledger/`) — `instances.shelf(slug)` = **the ONE slug→path mapping** (`instances.js:11-13`) · `instances` \& `registry` are per-access getters (no Ledger.mount) · `lock/locks/spawn/kill` · `Lock.alive()` probes **SIGURG** · `Process` detached → unref.
- **vip/pensieve** — `supply()` = registry.json ?? seed; `mount()` registers every `*.viva.js` under a tapped root, owner-stamped. **`Pensieve.register` last-wins SILENTLY on identical owner/type/slug/version (pensieve.js:22) — no shadow detection**; only the walker skip-list `bak|archive|slp` (`belt/find.js:11`) hides today's ~10 shadow copies under `~/.viva/registry/education/bak/` (the LEDGER's registry, not the repo's).
- **ghost** — `ghost.sh` sources config env, `VIVA_PROCESS_ID=${VIVA_PROCESS_ID:-$PPID}` (invoker owns the session). `mod.js`: `ctx.call` chaining (`use italian run`) · cwd stratum when shell cwd holds an instance marker · `ctx.interactive` ruled once · `--instance` flag slug→path via `belt/path.js instance()`. **Frame law**: operator tokens with a separator resolve in shell cwd; bare slug → shelf. MOUNT ALWAYS MEANS PATH.

## verbs (wired: trajectories/{ledger,registry,instance}; sheets/ is DEAD to the CLI — not in trajectories/index.js)

| verb | writes | note |
|---|---|---|
| ledger/init | mkdirs, seeds instances.json, optional config-env line | |
| ledger/doctor | **REAPS dead-pid sessions** (collectSessions → Deno.remove) | a MUTATING read — never "safe probe" |
| registry/tap · untap | registry.json (+clone if remote) · record removal only | store keeps untapped copies |
| registry/bootstrap | new package.viva.js named by DESTINATION | clone never shadows source |
| instance/create | clone.tree **+ instances.json record** (m44 landed); `--use` chains into instances/use | `--slug=<name>`; a held slug is a hard error |
| instances/use | session file; `--ledger` → **ledger `.env` line upsert** (`state.env`) | bare use in a pipe = report only; `--ledger` is undeclared in the schema ([[known-issues]]) |
| instances/tap · rename | record write · record key move (+ locks, log dir) | tap needs `--slug`; rename refuses while running |
| instance/init · run · start · stop | .env seed/locks/register · locks · locks · SIGTERM+lock rm | |
| instance/auth | network only | |
| instance/doctor | none (ensureDir no-ops; publish = process-local) | **the ONE read-only probe — my control surface** |

## invariants (each measured)

1. **MOUNT MEANS PATH, never slug** — three enforcement points: populate throw, `belt/path.js instance()`, `--instance` flag resolve.
2. Secrecy by KEY at one ingress; session+ledger loads route through the split since the blast (populate.js:87-101).
3. `fn.once` second call = `undefined`, not the memo — hence doctor's `.catch(() => null)` wrap.
4. instances.json = intended sole identity, but **m44 is PENDING**: target.js still double-derives (manifest.slug ?? basename; lock identity from mount basename), no lookup/rename/remove, create writes no record.
5. `ledger/doctor` mutates; `instance/doctor` doesn't. Interpret with instance/doctor + raw file reads; propose ledger/doctor when reaping is wanted.

## live snapshot (rots — restamp on read)

09-01: instances = language-learning · stucatch (both on the shelf). stucatch RUNNING detached (locks runtime 23092 + kajuit 23093, pids alive). Sessions 5102/65767 both dead-pid stale (next ledger/doctor reaps). Registry: 5 taps (playground/fixtures/viva absolute; education/stucatch store-relative); young-ladys-primer in store, untapped. Post-blast: language-learning instance stratum shrank 11→2 keys — 9 serve/remote keys stranded in its now-unread environment.json; `~/.viva/.env` absent. beef owes quest step 6 (fold 3 environment.json files into .env).

## ownership protocol (mine)

- Any landing in `subsystems/paladin/**` or `systems/ghost/trajectories/{ledger,instance,registry}/**` → restamp THIS file same turn (world-sync law; stamp names the CHECK).
- The ledger teaches: verify by reading `~/.viva` directly + `instance/doctor --json`; never run a verb without reading its trajectory first; never write `~/.viva` by hand — the verbs are the write path (channel-fidelity).
- Standing watch: the `use --ledger`→environment.json dead write · the pensieve shadow-overwrite gap · m44's landing (flips invariant 4 to enforced).
