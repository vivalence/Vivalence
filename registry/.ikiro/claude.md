# IKIRO — registry (container)

Marketplace. Flat namespace of `.viva.js` manifests, indexed by paladin's VIP. Every kernel, mode, service, and circuit lives here. Read `.ikiro/CLAUDE.md` first.

## architecture

every entry exports `manifest`; paladin indexes by manifest coordinates.

The registry has no runtime behavior — it is structure. Directories under `registry/{kind}/@vivalence/{type}/{slug}/{slug}.viva.js`. Each `.viva.js` exports `manifest` (the identity contract) plus type-specific content. Paladin's VIP mounts the registry, walks every `.viva.js`, parses each manifest, and registers in pensieve under owner → type → slug → version. Resolution is `paladin.vip.accio("@vivalence/{type}/{slug}@{version}")`.

structure:

```
registry/
├── kernels/@vivalence/    domain knowledge, ontologies, curricula  (see kernels/.ikiro/CLAUDE.md)
├── modes/@vivalence/      game modes + tactics                      (see modes/.ikiro/CLAUDE.md)
├── services/@vivalence/   provider/consumer infrastructure          (see services/.ikiro/CLAUDE.md)
└── wafers/@vivalence/     circuits — system composition declarations
    └── variant/multiplayer/   the active multiplayer variant
        ├── server/runtime.viva.js
        ├── server/daemon.viva.js
        └── client/client.viva.js
```

manifest contract:

```javascript
export const manifest = {
  type: "domain" | "ontology" | "topology" | "game" | "tactic" |
        "service" | "datamap" | "hallucinator" | "lighthouse" | "circuit",
  slug: "unique-identifier",
  name: "Human-readable name",
  version: "0.0.1",
  traits: [...],
};
```

type-specific exports (beyond manifest):

| type | additional exports |
|------|-------------------|
| domain | entities, modes, traits, aperture |
| ontology | dataset (symbol hierarchy) |
| topology | dataset (literals + symbol associations) |
| game | buffer (BufferView), emitter (Vector), dataset (intent[]) |
| tactic | emitter (composed Vector across phases), dataset (intent[]) |
| service | provider(config), optionally aperture |
| datamap / hallucinator / lighthouse | provider(config) (plus aperture for ATTACHED) |
| circuit | runtime, clients, daemons[], services[] |

discovery + loading:

```
1. circuitry declares module references as strings: "@vivalence/domain/language-learning"
2. paladin scans registry directories on boot, imports every .viva.js, registers each in pensieve
3. paladin.vip.accio(query) parses the string via cast.lookup() → fetches from pensieve
   no version → highest via semver.compare; with version → semver.satisfies
4. runtime calls accioMap(daemon.mask) to bulk-resolve a daemon's full dependency tree
```

circuits (`wafers/`):

A circuit's `.viva.js` is the system declaration:

```javascript
export const manifest = { type: "circuit", slug: "runtime" };
export const runtime = { slug, statics, datamap };
export const services = [...];
export const daemons = [{
  slug, kernel: [...module refs], modes: [...module refs],
  lighthouse: {...}, datamap: {...}, hallucinator: {...},
  consume: {...},
}];
```

Paladin's `resolve.circuitry()` finds these (filter `type=circuit`), then `resolve.variant()` compiles them into `paladin.variant` with mount points per daemon/service. Currently only `wafers/@vivalence/variant/multiplayer/` is active.

## context

consumers:

- paladin — VIP mounts and indexes the entire registry on boot
- runtime — resolves all daemon dependencies via `accioMap`
- daemon lifecycle — modes, kernels, services loaded during populate phase

testing gaps:

- no registry-level integration tests for `.viva.js` loading
- no manifest validation tests (missing fields, version conflicts)
- no VIP cross-entry resolution tests

active work:

- new modes incoming (Tier 2/3 — reorder, dictation, minimal-pair)
- VOCALIZED / asset entity type — pending typology enum expansion (see `.ikiro/longdistance.workpackage.org`)
- Note entity type (persistent cross-session state)
- hallucinator → cortex contract migration (see `.ikiro/cortex.workpackage.org`)
- VIP evolving toward jj-driven discovery scopes (see `.ikiro/very-important-packagemanager.workpackage.org`)

archived:

- `modes/@vivalence/game/bak/` — agent, strategy, tactic (old version), teacher, 11+ legacy modes
- `kernels/@vivalence/topology/bak/` — Spanish, Latin, other languages
- `services/@vivalence/hallucinator/bak/` — hal257 retired, plus Groq, OpenAI, Perplexity, TogetherAI legacy archive

maintenance — adding a new entry:

1. `registry/{kind}/@vivalence/{type}/{slug}/{slug}.viva.js`
2. export manifest + type-specific content
3. wire into circuitry (daemon's kernel/modes, or system-level service) if needed
4. VIP discovers it automatically when its parent directory is mounted
