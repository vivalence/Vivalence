---
paths: ["systems/kajuit/**", "subsystems/dapper/**", "subsystems/drapes/**"]
---
<!-- writer: agent · derived-from: systems/kajuit + subsystems/{dapper,drapes} + corpus read · verified: session c795a2f7 · limit: 35 lines -->
# codemap: kajuit — surface (SvelteKit SPA, thin client) + dapper/drapes

⚠ beef-observed weak flank: *"claude codes like SHIIITTT on the client"* — slow down here, read tokens, no one-off hacks. See [[identity]].

- **decks** (ship metaphor, set once at `+layout.svelte`): LIGHTHOUSE (auth/daemons) · QUARTERS (terminals LocalRepository + `$active`) · BRIDGE (layout stores, localStorage) · BOX (audio hardware singletons — never construct in a panel). THREAD = navigational pivot.
- **terminal**: functional (no class boot); `get buffer()` transparent accessor; **stall** = reactive fn over `(thread.$buffers, terminal.$buffer, thread.$phase)` + injected `pull`(AIMED)/`depth`(QUEUEING); **`thread.engage(name)` = THE phase gate** (live `$integrity` fold → `$errors` → `$phase`). ThreadTraits = free-fn capabilities `{aimed,queueing,conversational}`.
- **pincer** (T-bone): viket grip `{x,y}`+orientation → panel rects + bones; panels A(buffer+dock) B C(D|E|F) D(nav) E(traits) F(factory) G(telemetry) H(inspector); shoulder widgets (`bones/shoulder/widgets/Phase.svelte` — status·label·controls·queue, vinca digrams, drives engage).
- **barrel rule**: consumers import `@vivalence/kajuit` only; entity files must NOT import the barrel (TDZ cycles).
- **style gotchas**: scoped `> *` doesn't cross child component roots (the pointer-events trap) · Svelte 5 `$state` doesn't deep-track class instances → atom-backed `$field` + chain-subscribe · never name props state/derived/effect.
- **dapper/drapes**: dapper = build-time tokens/themes/zones (skeleton/theme/system triples; `data-zone`); drapes = components consuming CSS vars only (never dapper JS); font scale 2xs..8xl = single typography source; drapes `<Icon carbon=…>` app-layer ONLY (crashes in buffer bundles — inline SVG there).
