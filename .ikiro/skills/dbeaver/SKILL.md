---
name: dbeaver
description: CRUD DBeaver connections by editing data-sources.json (desktop DBeaver has no API); `create-instance <slug>` mounts every *.viva.db of an instance. Quit DBeaver first.
when_to_use: "add the <slug> dbs to DBeaver" · "point DBeaver at this sqlite file" · after `viva instance/create` · which connections exist.
---

# dbeaver · the connection registry is a JSON file

## The one rule

**DBeaver must be closed before any write.** DBeaver holds the whole registry in memory and rewrites the file on save and on exit, so an external edit made while it runs is clobbered without warning. `DataSourceRegistry.refreshConfig()` also short-circuits while `saveInProgress` is set.

```sh
pgrep -fl dbeaver          # must print nothing before you write
```

Safe sequence: quit DBeaver → run the script → start DBeaver. If DBeaver is already open and you wrote anyway, do NOT save from the UI. Press **F5 on the project node in Database Navigator** first (that calls `DBNProject.refreshNode()` → `refreshConfig()`, reloading from disk), then work normally.

## The file

```
~/Library/DBeaverData/workspace6/General/.dbeaver/data-sources.json
```

Tab indented, no trailing newline. Top-level sections `folders` · `connections` · `virtual-models` · `connection-types`. The script touches `connections` only and round-trips every other section reparse-identical. Secrets live beside it in `credentials-config.json` (AES encrypted, well-known key). SQLite needs none, so this tool never touches it.

## The entry shape

```json
"viva-italian": {
  "provider": "sqlite",
  "driver": "sqlite_jdbc",
  "name": "viva italian",
  "save-password": true,
  "configuration": {
    "database": "/Users/finn/.viva/instances/italian/mountpoint/daemon_italian/italian.viva.db",
    "url": "jdbc:sqlite:/Users/finn/.viva/instances/italian/mountpoint/daemon_italian/italian.viva.db",
    "type": "dev"
  }
}
```

`database` is load-bearing, not decoration. Absent `configurationType` defaults to `MANUAL`, and in MANUAL mode `DriverDescriptor.getConnectionURL` **ignores the stored `url`** and regenerates it from the driver template `jdbc:sqlite:{file}`, where `{file}` is `configuration.database`. A `url`-only entry connects to `jdbc:sqlite:` with an empty path. Write both.

## The verbs

```sh
deno run -A .claude/skills/dbeaver/dbeaver.js list
deno run -A .claude/skills/dbeaver/dbeaver.js read viva-italian
deno run -A .claude/skills/dbeaver/dbeaver.js create viva-italian ~/.viva/instances/italian/mountpoint/daemon_italian/italian.viva.db --name "viva italian"
deno run -A .claude/skills/dbeaver/dbeaver.js update viva-italian --name "italian daemon" --path ~/.viva/instances/italian/mountpoint/service_multiplayer/lighthouse.viva.db
deno run -A .claude/skills/dbeaver/dbeaver.js delete viva-italian
```

`create` refuses an id that exists and a path that does not (`--allow-missing` overrides the second). `update` and `delete` refuse an unknown id. All four exit 1 on refusal. Paths resolve to absolute, `~/` expands.

`--file <path>` points the script at a copy instead of the real registry. Always the way to rehearse.

## The viva convenience

```sh
deno run -A .claude/skills/dbeaver/dbeaver.js create-instance hello-world --dry
deno run -A .claude/skills/dbeaver/dbeaver.js create-instance hello-world
```

Reads `~/.viva/instances.json`, walks `<mount>/mountpoint/` recursively, and mints one connection per `*.viva.db`: id `viva-<slug>-<stem>`, name `viva <slug> <filename>`. Existing ids print as `skipped`, never overwritten. `--dry` prints the plan and writes nothing.

## Why the file edit and not DBeaver's own surfaces

- Desktop DBeaver has **no REST and no GraphQL API**. The GraphQL API is CloudBeaver / Team Edition only. ([CloudBeaver GraphQL](https://dbeaver.com/docs/cloudbeaver/GraphQL-API-overview/))
- The CLI can create a connection: `-con "driver=sqlite|database=/path/x.db|name=X|create=true|save=true"`, plus `-reuseWorkspace`, `-disconnectAll`, `-closeTabs`, `-stop`. ([Command line](https://dbeaver.com/docs/dbeaver/Command-Line/)) It launches the GUI to do it, takes one connection per invocation, and has a long tail of "connection not saved" bugs ([#15100](https://github.com/dbeaver/dbeaver/issues/15100)). There is no `dbeaver-cli` binary in the macOS `.dmg`, only `DBeaver.app/Contents/MacOS/dbeaver`; `dbeaverc.exe` is Windows-only.
- The file is documented as the supported portability and pre-configuration surface. ([Configuration files](https://dbeaver.com/docs/dbeaver/Configuration-files-in-DBeaver/) · [Pre-configured connections](https://dbeaver.com/docs/dbeaver/Admin-Manage-Connections/))

## Caveats, measured

- **Live pickup is not automatic.** `NavigatorResourceListener` does watch for a `.dbeaver/data-sources*` resource delta and calls `refreshConfig()`, but that needs the Eclipse workspace to notice the change, and DBeaver never enables Eclipse auto-refresh (`refresh.enabled` is absent from `workspace6/.metadata/.plugins/org.eclipse.core.runtime/.settings/org.eclipse.core.resources.prefs` and set nowhere in the plugins). Treat F5 on the project node as the only reliable reload.
- **Backup is one-time.** The first write copies the file to `data-sources.json.bak` beside it; later writes leave that first snapshot alone. Delete the `.bak` to re-arm it. No collision with DBeaver's own snapshot, which is dot-prefixed (`.data-sources.json.bak`).
- **Rewrite is semantically exact, cosmetically not.** Verified: reparse after create + update + delete is identical to the original document. Bytes differ in two harmless ways. DBeaver emits `virtual-models` as one compact line while `JSON.stringify` expands it (224 → 249 lines), and Gson HTML-escapes `<` as the literal six characters `\u003c` where `JSON.stringify` leaves it literal. Both reparse the same and DBeaver restores its own style on next save.
- Additional keys DBeaver backfills on its own save (`configurationType`, `closeIdleConnection`, `auth-model`, `custom-properties`) are not written by the script and are not needed to connect.

## The real write, for beef

```sh
pgrep -fl dbeaver     # must be empty
cd /Users/finn/vivalence/code/vivalence
deno run -A .claude/skills/dbeaver/dbeaver.js create-instance hello-world --dry
deno run -A .claude/skills/dbeaver/dbeaver.js create-instance hello-world
```
