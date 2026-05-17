> ⚠️ **VCS READ-ONLY.** Never run mutating `git`/`jj`. ALL graph mods (rebase, describe, new, edit, restore, op restore, push, fetch, import, abandon, squash, split) require explicit per-op `go` from Finn. Propose → wait → Finn runs via `!`. See root `.ikiro/claude.md` banner. **VIOLATED 2026-05-04 — NEVER AGAIN.**

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
└── wafers/@vivalence/     variant markers — system composition declarations
    └── variant/
        ├── multiplayer/       active production variant
        │   ├── server/runtime.viva.js
        │   ├── server/daemon.viva.js
        │   └── client/client.viva.js
        └── localhost/         local-development variant
```

manifest contract:

```javascript
export const manifest = {
  type: "domain" | "ontology" | "corpus" | "game" | "tactic" |
        "service" | "datamap" | "hallucinator" | "lighthouse" | "variant",
  slug: "unique-identifier",
  name: "Human-readable name",
  version: "0.0.1",
  traits: [...],
};
```

(`type: "circuit"` was the pre-M1 marker name. Migrated to `type: "variant"` 2026-05-18 — single marker per scope. See root `.ikiro/quests/variant.quest.org`.)

type-specific exports (beyond manifest):

| type | additional exports |
|------|-------------------|
| domain | entities, modes, traits, aperture |
| ontology | dataset (symbol hierarchy) |
| corpus | dataset (literals + symbol associations) |
| game | buffer (BufferView), emitter (Vector), dataset (intent[]), optionally tools (Vector for TOOLED trait) |
| tactic | emitter (composed Vector across phases), dataset (intent[]) |
| service | provider(config), optionally aperture |
| datamap / hallucinator / lighthouse | provider(config) (plus aperture for ATTACHED) |
| variant | runtime, clients{}, daemons{}, services{} (single-marker; replaces type:"circuit") |

discovery + loading:

```
1. variant marker declares module references as strings: "@vivalence/domain/language-learning"
2. paladin scans registry directories on boot, imports every .viva.js, registers each in pensieve
3. paladin.vip.accio(query) parses the string via cast.lookup() → fetches from pensieve
   no version → highest via semver.compare; with version → semver.satisfies
4. runtime calls accioMap(daemon.mask) to bulk-resolve a daemon's full dependency tree
```

variant markers (`wafers/`):

The variant's `.viva.js` is the system declaration. Single file per scope. Post-M1 shape:

```javascript
export const manifest = { type: "variant", slug: "multiplayer" };
export const runtime = { slug, statics, datamap };
export const services = { lighthouse: {...}, hallucinator: {...}, ... };  // object, keyed by slug
export const clients = { ghost: {...}, kajuit: {...} };                    // object, keyed by slug
export const daemons = { brazilian: {                                       // object, keyed by slug
  slug, kernel: [...module refs], modes: [...module refs],
  lighthouse: {...}, datamap: {...}, hallucinator: {...},
  consume: {...},
} };
```

Paladin's `resolve.variant()` finds the single marker (filter `type=variant`), extracts runtime, merges client configs, wraps each daemon/service spec in a Mask with a mount point at `scope.mountpoint/{daemon,service}_{slug}`. Active variants: `wafers/@vivalence/variant/multiplayer/` (production) + `wafers/@vivalence/variant/localhost/` (local dev).

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
- VOCALIZED / asset entity type — pending typology enum expansion (see `.ikiro/longdistance.quest.org`)
- Note entity type (persistent cross-session state)
- hallucinator → cortex contract migration (see `.ikiro/cortex.quest.org`)
- VIP evolving toward jj-driven discovery scopes (see `.ikiro/very-important-packagemanager.quest.org`)

archived:

- `modes/@vivalence/game/bak/` — agent, strategy, tactic (old version), teacher, 11+ legacy modes
- `kernels/@vivalence/corpus/bak/` — Spanish, Latin, other languages
- `services/@vivalence/hallucinator/bak/` — hal257 retired, plus Groq, OpenAI, Perplexity, TogetherAI legacy archive

maintenance — adding a new entry:

1. `registry/{kind}/@vivalence/{type}/{slug}/{slug}.viva.js`
2. export manifest + type-specific content
3. wire into circuitry (daemon's kernel/modes, or system-level service) if needed
4. VIP discovers it automatically when its parent directory is mounted
