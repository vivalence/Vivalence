---
paths: ["subsystems/paladin/**", "systems/runtime/**", "systems/ghost/**", "**/.viva/**"]
---
<!-- writer: agent · limit: 2200 chars · traps only · the composition compiler + the ledger ~/.viva -->
# codemap: paladin · ledger

- **env**: a key's fate is its PREFIX — `""` BLANK · `SECRET_*` · `VIVA_*`/`PUBLIC_VIVA_*` held · else ignored. `env.vars` is RAW templates; a human reads `env.get(key)`. Never guard `secret.has(…) && {…}` — a blank-secret provider is PRUNED pre-boot. Never log a mask. `.env` is AUTHORED by LINE upsert; a blank at a higher stratum SHADOWS.
- **scopes**: FIVE — ledger · instance · mountpoint · repository · registry. A `*_MOUNT` is a PATH, never a slug (`instances.json` is the sole slug→path identity). The lifecycle OWNS mount (`fn.memo`); `remount` is dead.
- **the recipe** `~/.viva/ledger.viva.json`: `runtime · datamap · hallucinators · clients · services` fall through WHOLE to an instance omitting the slot (`[]` = none); `environment` composes as a TypeBox interface — a key NARROWS restating its `type`, a retype throws. `Ledger.record(slot)` re-reads per call — never freeze a scope at import. Faults are SENTENCES on `instance.faults`.
- **registry**: lookup is `@owner/<manifest.type>/<manifest.slug>` — the MANIFEST's words, never the directory; `owner` is AUTHORED. `tap` = materialize + record; a nested package declaration ends the parent's mount. `accio` folds mask over module (mask wins, traits ACCUMULATE); `revelio` returns a per-call clone. Traits and types are an OPEN SET. Discovery skips `bak archive node_modules .git`.
- **the ledger is written by the verbs only** — `ledger/init` → `registry/tap` → `instance/create --use --init`; `~/.viva/instances/*` and NO-VCS packages = capture to `~/.viva/bak/` before delete. A scratch walk needs its own `VIVA_PROCESS_ID`, cwd, `XDG_CONFIG_HOME` and a COPY of the instance dir.
- **locks**: a lock read is a lock WRITE (SIGURG + reap); `Die.json` = `{ pid, token, instance, status, processes: [...] }`; `Ledger.boot` refuses a held port. A db file is DERIVED `<slug>.viva.db` — an old slug boots GREEN on an EMPTY db. `registry.json` taps the LIVE checkout's `commons` by absolute path.
