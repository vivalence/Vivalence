---
paths: ["subsystems/paladin/**", "systems/runtime/**", "systems/ghost/**", "**/.viva/**"]
---
<!-- writer: agent · limit: 6200 chars · per item from methods/census.py · code is the map · the composition compiler + the ledger ~/.viva -->
# codemap: paladin · ledger — two subjects, the ledger, the lexicon (m91, 10-19)

- **`gestalten/belt/` — 12 `default` closures over `paladin` (`find read check state is scope publish source clone bundler expand envfile`), one importer `index.js` → `paladin/prototype.js` + `gestalten/index.js`, reach 51; `ignore.js` ← `find.js` + `gestalten/tools/fs.js`; `scribe.js` DEAD (`state.js:44`).**
```js
// subsystems/paladin/tests/expand.test.js:75
    const held = paladin.expand(
      { serve: "${VIVA_PROBE_SERVE}", port: "${VIVA_PROBE_PORT}", key: "${SECRET_VIVA_PROBE_A}", gone: "${SECRET_VIVA_PROBE_B}", plain: "kept", count: 3 },
      record,
      "runtime",
```
- **`gestalten/tools/` (was `skills/`) — `fs.js` (`resolve absolute fs`, also ← `shell.js`) · `shell.js` (`shell`); `index.js` (`*fs *shell`) ← `mod.js` → `paladin.tools`, and `deno.jsonc` `./tools`.** The only Vectors in paladin.
```js
// commons/instances/hello-world/tests/catalog.snapshot.test.js:55
      .graft(paladin.tools.fs.fs)
      .graft(paladin.tools.shell.shell)
```
- **`instance/` — `prototype.js` `Instance` (← `paladin/lifecycle.js` `instance`); `factory.js` `factory` = `fn.memo` keyed on the instance (`:6`): `population` `environment · recipe` → `resolution` `defaults · mountpoints` → `integration` `settle` → `publish`; `resolution` also holds `inherit` (← `population.js`).** Read as `factories.instance(paladin.instance)` (was `lifecycle.mount`).
```js
// subsystems/paladin/tests/boot.test.js:35
    const first = factories.instance(lifecycle.paladin.instance(fresh));
    await first.catch(() => null);
    expect(factories.instance(fresh.instance)).toBe(first);
```
- **`ledger/` tested — `index.js` (`*prototype *registry`) ← `paladin/prototype.js` + `typology.js`; `prototype.js` (`RECIPE RECORDS derive Ledger`) · `registry.js` (`Registry`) reach 52; `integrity.js` (`TRAITS RULES probe`) ← `registry.js` only.**
```js
// subsystems/paladin/tests/boot.test.js:10
    const fresh = new Paladin();
    expect(fresh.ledger).toBeInstanceOf(Ledger);
    fresh.scopes([["ledger", () => true, () => new Path("/tmp/boot")]]);
    expect(fresh.ledger.registry).toBeInstanceOf(Registry);
    expect(fresh.ledger.registry).toBe(fresh.ledger.registry);
```
- **`ledger/` untested — `die.js` · `lock.js` · `log.js` ← `prototype.js`; `process.js` ← `die.js`; `instances.js` (`NOTHING Instances`) ← `prototype.js` + `instance/prototype.js`; reach 1–2.** A lock read DELETES a dead lock.
```js
// subsystems/paladin/ledger/lock.js:23
    if (!alive(lock.pid) || (lock.processes.length > 0 && lock.processes.every(gone))) {
      await this.remove();
      return null;
    }
```
- **paladin varies by DECLARATION in `paladin/lifecycle.js` (`scopes([[name, condition, resolver]])`, resolved at use), never by a constructor argument; IMPORTED by a system or a lifecycle beat, never on a die (`instance` crosses); every path it knows is a `*_MOUNT` · `*_FILE` env var with a default.** REJECTED 10-21: `new Paladin([...belts])` · a `vault` on the die · a hardcoded `credentials.json` branch.
- **`mod.js` (`default` = the booted paladin) — 46 direct (runtime · ghost · anima · commons · testament), reach 47; runs `paladin/lifecycle.js` `env · scopes · instance` (+ `statements` for a citizen) at import, then re-exports `factories · lifecycle` from `typology.js`.** Its LOCAL `lifecycle` is paladin's phases; its EXPORTED one is `{ paladin, instance }`.
```js
// subsystems/paladin/mod.js:5
const paladin = new Paladin();
paladin.tools = tools;
await lifecycle.env(paladin);
await lifecycle.scopes(paladin);
lifecycle.instance(paladin);

if (paladin.is.citizen) {
  await lifecycle.statements(paladin);
}

export default paladin;
export { factories, lifecycle } from "./typology.js";
```
- **`paladin/` — `prototype.js` `Paladin` ← `mod.js` + `typology.js`, reach 50 · `lifecycle.js` (`env scopes instance statements secure`; a slug in `VIVA_INSTANCE_MOUNT` throws, `:44`) · `pensieve.js` `Pensieve` (← `ledger/registry.js`) · `manifest.js` `Manifest` (← `pensieve.js`, no test) · `readme.org`.**
```js
// subsystems/paladin/tests/pensieve.test.js:11
    const pensieve = new Pensieve();
    pensieve.register(module("@education", "game", "write"));
    const found = await pensieve.revelio({ owner: "@education", type: "game", slug: "write" });
```
- **`typology.js` — predicative: `Paladin Pensieve Manifest Instance` + `*ledger` + `*gestalten` + `factories { instance }` + `lifecycle { paladin, instance }`; ← `mod.js` + 2 `testament/m82-clients-20261012` files; tests read it as `@vivalence/paladin/typology`, boots nothing.** `paladin/index.js` · `instance/index.js` have NO importer — `typology.js` reads the files.
```js
// subsystems/paladin/typology.js:10
export const factories = { instance };
export const lifecycle = { paladin: paladinLifecycle, instance: instanceLifecycle };
// subsystems/paladin/tests/boot.test.js:3
import { Paladin, Ledger, Instance, Registry, factories, lifecycle } from "@vivalence/paladin/typology";
```

```jsonc
// subsystems/paladin — census 10-19 (files · exports · files a test uses)
{ ".": [2, 10, 1], "paladin": [5, 12, 3], "instance": [3, 5, 2], "instance/lifecycle": [4, 9, 3], "ledger": [9, 16, 3],
  "gestalten": [1, 2, 0], "gestalten/belt": [15, 16, 0], "gestalten/tools": [3, 6, 2] }
```
```jsonc
// ~/.viva
{
 "dirs": ["bak", "instances", "locks", "logs", "registry", "sessions"],
 "files": [".env", "credentials.json", "environment.json", "instances.json", "ledger.viva.json", "registry.json"],
 "instances.json": ["localhost"],
 "registry": {
  "assembly": "tapped · git", "chess": "tapped · git", "droneaid": "tapped · git", "education": "tapped · git",
  "media": "untapped · NO-VCS", "stucatch": "untapped · NO-VCS", "vcompany": "untapped · NO-VCS",
  "young-ladys-primer": "untapped · git"
 },
 "off-registry taps": { "@commons": "<checkout>/commons", "@memo": "<checkout>/commons/fixtures/memo" }
}
```
