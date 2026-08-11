# frontier — the live edge
<!-- writer: agent · derived-from: quests/ + code + private logs · verified: registry manifests re-read live (kajuit + runtime `:alpine` digests, config `created`, `Docker-Content-Digest` headers) · eviction: m30 DONE bullet dropped to quests/done/, deploy tail merged to one item · limit: 8000 chars -->

Derived — re-derivable from quests + code + logs. Update at every disintegrate. Last full corpus read: **architecture coherent and contradiction-free; the debt is live-validation, not design.**

## the four gates (nearly everything open funnels through these)

1. **M4.0 baseline** — beef's manual click-walk of the playground rig. Gates the M4→M5→M9→M10 stall/widget/monkey chain. beef-driven.
2. **one live daemon run** — MOSTLY CLEARED. **italian** has a full end-to-end live run; prod now boots 3 daemons (brazilian · spanish · italian, seen in the m30 walk dump). **m26 PARTIALLY validated live** — watcher booted post-emigration; a full francesca turn with a thread-pinned tune still owed. **IPv6 only** — `http://[::1]:2501`; `/daemon/italian/metadata/modes` → 401 means mounted+routing. Never-run-live: G2/G3/G4, nyan playroom, longdistance audio.
3. **beef go / fork-pick** — closed-class (spec locked) · aprende↔nyan refill (3 forks) · m11 remainder 11.4 (docker/docs; plan killed by fork 10, wants a re-plan).
4. **M3 anthropic SSE stream bug** — blocks toolcalling scale (cache_control), cross-mode emit, audio verify.

## live quests

**HOT** — **m26 LANDED** → [[m26-hallucinate-contract]] (`{condition,output}` every seam · skills/entities emigrated to daemon · thread.trait.INTELLIGENT; live-validation owed = gate 2) · **m27 mind** (memory+note + index projection; recall LATER) · **m28 primed** (the procedural trait, extracted to own quest — was "skilled", RENAMED) · **m25 user-and-thread** (PRELIMINARY — beef picks up)
**WOUND DOWN** — **m23** (III + II.1 LANDED live · II.2 → m27 · I = beef-side ongoing · tool rebuild SUBSUMED into m26 layer ② · trailing drift parked in quest) → [[project_m23_domain_root_tutor]]
**ACTIVE** — wafer-lifecycle P5 · pincer 18+ · stage-canvas-devtools · language-learning-modes tier 2 · variant M3+ · kajuit_client-layout · terminal-first-client P1 · kajuit-build-target · **kajuit-boot-display** (LANDED+VERIFIED LIVE; 2 bugs open: `STORAGE_KEY` stringifies a `Url` to `[object Object]` (`lighthouse.js:6`) · `hydrate` writes `{}` over the token on COLD tabs (`:197`))
**IMPLEMENTED, LIVE OPEN** — **m24-rep-o-gram** (milestones 1–5 + shell + `tools/provision` LANDED; AGENTIC is a FINALIZER; THE FOCUS LAW lives in the kajuit shard; suite 6/26 green post-m26. Owed: milestone 6 live validation on a phone) → [[project_rep_o_mat]]
**IMPLEMENTING** — longdistance (audio: enum ✓, variant wire + live boot next) · english-to-spanish (M1 A1+survival) · c-panel-rebuild (metadata cutover tail)
**BENCHED** — m22-datasink (runtime codemap shard + `35.02`) · m16_client_provisioning · m7-snapshot-testing (3 gaps) · ikiro-modernization (forks await beef)
**DONE** (quests → `quests/done/`) —
- **m31 package registry**: tap = materialize + record, mount is runtime's; `viva ledger/{tap,taps,untap,root,install}` SLASH-FORM only; docs `52.03_packages.mdx`. Residue: fork E in-body-unconfirmed · P4 daemon deferred. → [[m31-very-important-package-registry]]

## design held only here (no quest file — restate before building)

closed-class · exhibit-absorbs-shadow · herald · decorum M2-M5 (+dapper-second-theme behind it) · siphon · viva-init/install · ghost-autocompleting · identity-collapse (proposal) · documentation M2-M6 · m5 widget-glyphs · m9 playground-layout · m10 monkey (distinct from chaosmonkey) · m13 module/mode/kernel semantic alignment · m14 testing fixtures · m17 client-ctx grammar · twitch-vector (`fanout`; build when a real N-handler-per-path consumer lands). Homed elsewhere: m18 conversation-dissolves (BUILT) · generative-views (m19 LIVE, reader registration pending)

## simmering strands (from beef's logs — recurs, unshipped)

1. **docs/README** — #1 recurring (*"i need a readme"*, *"maaybe a video?! readme.mp4"*). Docs site BORN (Astro 7 on Deno), CONTENT unwritten.
2. **launch WBS** — install base → contributions → fundraising. *"Text + games only — no audio yet."*
3. **ad-hoc svelte buffer renderer** — LLM emits Svelte → rendered buffer (*"would be INSANE"*).
4. **kajuit architecture unease** — *"still .... ish. bit convoluted"*.
5. **docker/prod verify** — recurring unchecked `a.2 docker`; shadow-emit suspicion (*"faulty circuitry"*).
6. **lighthouse security flag** — *"at some point we need to close the lighthouse. soon."*
7. **detached spawn** — known-issue #1; blocks `viva instance start`.
8. **entities-TS 72 errors** — blocks npm/jsr publish of typology.

## known open tails (nothing else records them)

- kajuit image = pure function of the vite output bytes (final stage is `FROM nginx:alpine`; nothing of `vivalence/viva:alpine` survives), and its build stage took ZERO context input (`FROM base` + two bare `RUN`s) → cached base = no vite run = identical digest = `push` no-op = coolify pull with zero layers. `VIVA_STAMP` `--build-arg` now WIRED both sides (`.gitlab-ci.yml` `$CI_COMMIT_SHORT_SHA` · `deno.jsonc kajuit/stamp`), images carry an immutable `:$CI_COMMIT_SHORT_SHA` receipt tag, deploy webhooks live behind `$COOLIFY_TOKEN && $COOLIFY_BASE`. **Proof owed on the next pipeline: kajuit digest must move.** → [[the-kajuit-image-never-moved-because-its-build-stage-read-nothing-from-the-context-and-the-stamp-arg-was-never-passed]]
- m30 warts, flagged un-go'd: probe should swallow close-code 1001 at F5 teardown (typology) · per-MODE metadata boot volley ~35 calls (diet candidate: aggregate `/metadata/modes`) · `store()` coalescing riding epoch close (unlocks `persist()`-warm reloads)
- `domain/tools/harness.bak/` — dead parked dir, beef's to delete
- paladin + ghost suites need `--env-file=testament/variant/.env`; every `*/test` task is `--watch` and never exits — run `deno test` directly. `test/snapshots` is the REGENERATION path (`SNAPSHOT_HOT=1`), never extra coverage
- `soma.test.js` `memory` yield key on purpose — correct once m27 mints Memory
- thinking-OFF on a thinking model: `settings.effort` steers depth but on/off is `model.thinking` (faculty) — a thread cannot force it off
- beef's skill roadmap: daemon skills LANDED · paladin skills (fs/shell) · ghost skills — next standard-skill overrides via keyed layers
- Trace.thread silently null on the tool path (harnessed binds the raw id, `Literal.review` reads `.id`) — m25 open fork
- hardcoded language label + Portuguese pronouns across 6 game views ([[project_language_label_hardcoded]], un-go'd) — the surface beef types into for hours a day
- `traits/intented.js` never sets a user → **0 intent rows on every daemon** (its own TODO admits it)
- tactic themes hardcoded Portuguese in `survival/emitter/buildup.js` (21 slugs; 6/20 in italian) — derive from `symbol.find()`
- cloze unmountable on italian until sentences get ANNOTATED (0/1015)
- `selectMode` mints a BARE traitless thread → mutates the current thread's mode
- aprende `Aprende.svelte` carries the same latent mount race impara was hardened against
- soma.render/stream/execute want promotion into belt proper
- 4th tune-axis half-set (providers ship 3, cortex pads thrift 0.5) — documented, unresolved
- docs drift: `47.01_buffer-flow.mdx` still documents `result.buffers` (real shape = `entities.buffer`)

## standing beef-orders in force

percentage fader sticky · code-heavy answers permanent · caveman active · VCS read-only forever · manifest immutable · quests for plans · no unsolicited expansion · **`.ikiro/` autonomous — no gate** (beef: *"all inside ikiro is yours"*; self-mod transparent + git-reversible).
