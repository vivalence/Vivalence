---
paths: ["systems/ghost/**"]
---
<!-- writer: agent · derived-from: mod.js · prototypes/* · belt/* · trajectories/** · 12 test suites · ghost.sh · install.sh · verified: natures on disk = instance 10 · instances 3 · ledger 2 · registry 5; console.* outside bak = 11; Span = 4; drain() = 0; probes: lens.instances() · instance/doctor --json; tests = 12 files / 115 cases / 0 fixtures, import-gaps 0 for belt/* + 7 trajectories · limit: 13200 chars -->
# codemap: ghost — the operator (`viva`): argv in, one effect out

**`~/.viva` anatomy, the verbs' write paths and the lock/record/session lifecycle are OWNED at `world/ledger.md`.**

## the door — argv IS a signature

- **`ghost.sh`** sources `~/.config/viva/env` as plain `export` lines — the config **outranks** the caller's `VIVA_REPOSITORY_MOUNT` — sets `VIVA_PROCESS_ID="${VIVA_PROCESS_ID:-$PPID}"` (`$$` is this script's own pid; the shell that TYPED `viva` is the parent), then `exec deno run --config "$VIVA_REPOSITORY_MOUNT/deno.jsonc" -A …/mod.js "$@"`. `install.sh` symlinks it to `~/.deno/bin/viva`.

- **`prototypes/shellsignal.js`** extends typology `Signature` with ONE coercion: `head.split("/")` is the nature chain, `--` tokens flags, the rest positionals. **Params and flags hang on segment ZERO, not the leaf** — `signal.params` reads through to the head, so a handler never walks the chain; `absolute` rebuilds the argv verbatim. Nothing validates: an undeclared flag parses fine and is invisible to `help`.

```js
// systems/ghost/prototypes/shellsignal.js:17-33
for (const token of rest) {
  if (token.startsWith("--")) {
    const equals = token.indexOf("=");
    if (equals > 2) { flags[token.slice(2, equals)] = token.slice(equals + 1); }
    else { flags[token.slice(2)] = true; }
    continue;
  }
  params.push(token);
}
if (segments.length) { segments[0].params = params; segments[0].flags = flags; }
```

## dispatch — one Vector, one strategy, `ctx.call` re-enters it

- **`mod.js`** builds ONE `Vector` and runs `steer.dispatch.invoke(trajectory, signal, strategy)`. `traverse` returns `[effect, carry, steps]`; `strategy` wraps the carry (every `use`) AROUND the leaf and defaults `ctx.effect` to its return — **a handler sets `ctx.effect` or returns it, never prints.**
- **`ctx.call(argv)` is the SAME combinator**, so a chained verb (`create --use|--init`, `use <slug> <verb>`) inherits the span, the error catch and the mount frame; its context is pre-marked `rendered`, so a chain prints once, at the outer exit.
- **Middleware order is law** (`mod.js:24-121`): span open → error catch → `ctx.call` → cwd instance mount → view/render. The catch is INSIDE the span, so a fault is marked before it is swallowed, and the mount inside the catch, so a broken instance dir is an error, not a crash.

```js
// systems/ghost/mod.js:12-18, 60-66
const strategy = (carry, effect) => async (context) => {
  await carry(context, async (ctx) => { const result = await effect(ctx); ctx.effect ??= result; });
  return context.effect;
};
ctx.call = (args) => {
  const signal = args instanceof ShellSignal ? args : new ShellSignal(args);
  const inner = new ShellContext({ signal });
  inner.rendered = true;
  return steer.dispatch.invoke(trajectory, signal, strategy)(inner);
};
```

## rendering — effects ALWAYS print

- **`ctx.interactive` is the one ruling on whether this shell can prompt** — non-interactive `render` THROWS naming the nature, so a view in a pipe fails loud instead of hanging.
- **The default render is the safety net**: a handler leaving `ctx.rendered` false with a non-null, non-`{error}` effect gets it emitted through sheets' `Effect`; the five JSX views mark `rendered` via the wrapped `view.scroll`.
- **The ONE exit** is `fail()`, where a throw, a caught `ctx.error` and an effect carrying `.error` converge: `NOT_FOUND` → hint + **exit 127**, else one line (stack under `--verbose`) + **exit 1**. `--help` anywhere is rewritten at the door into `help <nature> <flags>` — help is a nature, not a branch on every handler.

```js
// systems/ghost/mod.js:88-96, 111-120
ctx.interactive = !flags.json && Deno.stdin.isTerminal() && Deno.stdout.isTerminal();
const marking = (verb) => (...args) => { ctx.rendered = true; return view.scroll[verb](...args); };
const render = ctx.interactive ? marking("render") : () => { throw new Error(`${nature}: needs a terminal …`); };
await next();
if (flags.json) { console.log(JSON.stringify(ctx.effect, null, 2)); }
else if (!ctx.rendered && ctx.effect != null && !ctx.effect.error) {
  await view.scroll.emit({ data: ctx.effect }, null, Effect);
}
```

## the verbs — four nouns

- **`instance/*`** SINGULAR, acts on the one you selected: `create · init · run · start · stop · delete · rename · doctor · lighthouse`. **`instances/*`** PLURAL, answers about the set: `list · use · tap`. **`ledger/{init,doctor}`** · **`registry/{doctor,list,tap,untap,bootstrap}`** — in `bootstrap` the destination NAMES the package and its declaration is REPLACED, not patched, so a clone never shadows its source in the pensieve.
- **`instance/lighthouse <signup|login> <user> <pass>`** is the auth verb — `Connection(instance.lighthouse.statics.remote).call("/auth/<action>")`. There is no `viva auth`. **`instance/init`** embeds the same call (signup falls to login on `USERNAME_EXISTS`) but first authors the `.env` FROM the schema (`belt/envfile.js`), `remount`s, then asks only for what is blank or `INVALID` — headless: `{env, fill, invalid, next}`.

## `belt/lens.js` + `belt/pick.js` — 0/1/N

- **A lens names the PROJECTION, never the store**: `modes({type})` folds `paladin.vip.pensieve`, `instances()` folds `ledger.instances.list()`. In `{label, rows, keys, facets, columns, reference, index?}`, `keys` is the fuzz haystack, `facets` the `key:value` grammar, `reference` what a caller retypes, `index` the live selection so the picker opens ON it. The fuzz includes `mount`, so a one-letter fixture slug matches every path.
- **`pick(ctx, lens, preset)`**: the preset's `/` become spaces, so an `@owner/type/slug` triple is three terms the haystack holds and resolves headlessly, while a filesystem path matches nothing (`null` — the caller keeps its own branch). ONE match answers through the SAME `search.seek` fold the picker runs; N in a non-interactive shell **throw with the candidates listed** — a picker in a pipe is a hang.

```js
// systems/ghost/belt/pick.js:11-28
const query = (preset ?? "").replaceAll("/", " ").trim();
if (!rows.length) throw new Error(`pick: no ${label} on this system — nothing to choose from`);
const state = search.seek(search.init({ rows, keys, facets }), query);
if (state.matches.length === 1) { const row = search.value(state); return { row, reference: reference(row) }; }
if (!state.matches.length && query) return null;
if (!ctx.interactive) throw new Error(`pick: '${query}' matches ${…} entries and this shell cannot prompt:\n${candidates}`);
```

```json
// probe: lens.instances()
{ "label": "instance", "index": 0, "keys": ["slug", "mount"], "facets": ["slug"],
  "rows": [{ "slug": "hello-world", "mount": "/Users/…/.viva/instances/hello-world", "updated": "2026-09-08" }],
  "columns": ["slug", "updated", { "key": "mount" }], "reference": "(row) => row.slug" }
```

## `belt/path.js` — the frame law

- **Frame owner first**: operator-typed → shell cwd; a declaration → the repo; a record → the ledger. The operator's cwd is `INIT_CWD ?? PWD ?? Deno.cwd()`, because `deno task` rewrites `Deno.cwd()`.
- **`pin()` resolves only PATH-SHAPED tokens**, refusing `://` and `@`; **`source()`** lets a remote survive verbatim, since pinning `git@host:path` would strip its remoteness. Instance REFERENCES never `pin` — `instances.resolve()` reads the RECORD or throws, which is how `--instance=` resolves at the door; the other four `MOUNTS` pin.

```js
// systems/ghost/belt/path.js:4-14
export const cwd = () => Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
export const pin = (token) =>
  token && (token.includes("/") || token.startsWith(".")) && !token.includes("://") && !token.startsWith("@")
    ? resolve(cwd(), token)
    : token;
export const source = (token) => (paladin.clone.remote(token) ? token : pin(token));
```

## `instance/target.js` — a child process

- **`specs(param)`** is ghost's whole contribution to running an instance: a `{identity, command}` pair per child fed to `paladin.ledger.boot` (→ `world/ledger.md` for the Die and the lock). `identity` is `{process, mount}`; boot adds the slug. The env is FILTERED — an allowlist plus every `VIVA_*` minus `VIVA_PROCESS_ID`: a child never inherits the operator's session.
- **`register()`** demands the mount be recorded, throwing the tap line otherwise; **`locate()`** sends a path through `instances.resolve` and a bare token through the instances lens — why `delete`, `rename`, `doctor` and `use` share a `[target]` grammar.
- **`instance/start`** spawns a DETACHED supervisor running `instance/run --logged`, then waits 60 s for the lock to read `ALIVE`, racing the supervisor's own exit. `run` decodes `128+n` back into a signal name — `deno task` launders a signal death into a plain code with `signal: null`.

```js
// systems/ghost/trajectories/instance/target.js:10-12, 54-56
const INHERITED = ["PATH", "HOME", "TMPDIR", "XDG_CONFIG_HOME", "TERM", "LANG", "DENO_DIR", "NO_COLOR"];
const carried = (key) => INHERITED.includes(key) || (/^(VIVA|PUBLIC_VIVA|SECRET_VIVA)_/.test(key) && key !== "VIVA_PROCESS_ID");
identity: { process, mount },
command: { bin: Deno.execPath(), args: ["task", "--config", config, "-q", CHILDREN[process].task], cwd: mount, env },
```

## snapshot — `viva instance/doctor --json`

```json
// viva instance/doctor --json (`vars` + most `env` rows elided; secrets print `***`)
{
  "manifest": { "type": "instance", "slug": "hello-world", "version": "0.0.1" },
  "daemons": ["hello"], "services": ["multiplayer"], "clients": ["kajuit"], "runtime": ["slug", "statics"],
  "env": [{ "!": "!", "key": "PUBLIC_VIVA_RUNTIME_REMOTE", "value": "http://localhost:2501/", "stratum": "instan", "reason": null }],
  "faults": [], "dormant": ["daemon[hello].hallucinators[1]"], "lock": null
}
```

## how it is tested

**12 suites · 115 cases · 0 snapshot fixtures** (84 `Deno.test("` · 26 `it("` · 5 `mounted("`). Fixtures are minted in the test (`Deno.makeTempDir` + a fake `VIVA_LEDGER_MOUNT`/`$HOME`). The `test` task is a `--watch`er; one file, repo root: `deno test -A --no-check --config deno.jsonc systems/ghost/tests/<file>`. Baseline **87/89**, both reds PRE-EXISTING and in [[known-issues]] — `strata.wet` *"two shells select two instances in parallel"* · the `ledger.test` init step.

- **Three shapes** — a unit suite hands the trajectory a FAKE ctx (`{signal, call}`) and reads `calls`; `ledger.test.js`/`registry.test.js` drive the REAL `Vector` through `mod.js`'s own `strategy`, copied verbatim; the two `*.wet.test.js` spawn the CLI with `clearEnv: true` on a temp `$HOME`.
- **Pins**: `shellsignal.test.js` *"single-segment command has no fin"* · `strata.wet` *"bare effects print — use without --json renders human, an ink view suppresses the default"* · `help.wet` *"help --json lists every nature with edge metadata"* · `pick.test.js` *"a non-interactive shell throws with the candidates instead of blocking"* · `strata.wet` *"path law — ./dotted and bare dir/sub both pin to the shell cwd, slugs stay symbolic"* · `target.test.js` *"register: an unrecorded mount throws the tap line and writes nothing"*.

```js
// test: systems/ghost/tests/create.test.js:96-100 · target.test.js:45-48
assertEquals(calls, [["instance/use", `${root}/instances/fixture`], ["instance/init"]]);
assertEquals(spec.command.env.VIVA_PROCESS_ID, undefined);
```

- **Gaps** — `grep -rl` → 0 in `tests/` and under `~/.viva/registry --include=*.test.*` for `belt/*.js`, `prototypes/shellcontext.js` and `trajectories/{help,instance/{run,start,stop,lighthouse,doctor,init}}.js`. `help`/`doctor`/`init` run WET; **`instance/{run,start,stop}` are argv fixtures in `shellsignal.test.js` alone and `instance/lighthouse` has zero mentions — the auth verb and the child-process lifecycle have NO coverage.**

## where to read the live system

- **Spans: 4 sites, all in-memory.** `mod.js:27-37` opens one `Span("ghost")` per invocation, marks `subject {schema:"signal", id:<absolute argv>}` and faults it on `ctx.error`; `run.js:14` branches `run/<process>`. **`drain()` sites: 0** — `.to(paladin.ledger.pipe)` is commented out (`mod.js:28,41`), so no ghost span reaches disk.
- **`console.*`: 11 sites outside `bak/`** — `mod.js` 5 (the `--json` dump, four `fail()` lines) · `start.js` 2 · `stop.js` 2 · `run.js` 1 (`run runtime=<pid> kajuit=<pid>`) · `sheets/text-select-a.js` 1. All else prints via the view.
- **Taps** — `viva help --json` = the command inventory · `instance/doctor --json` = the snapshot above · `<ledger>/logs/<slug>/` = the only durable ghost-side output, written under `instance/run --logged`. `ledger`/`registry` `doctor` report too, but WRITE.

