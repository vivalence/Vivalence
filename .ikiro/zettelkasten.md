# Zettelkasten

> Ideas for documentation improvements. Capture, evaluate later, implement the good ones.

---

## Structural
- [ ] **Cross-reference graph**: Fill Where Used stubs with real import traces
- [ ] **Code snippet anchors**: 2-3 short snippets per doc showing compositional elegance
- [x] **Quick-start per doc**: First 5 lines answer "what is this, what files matter" — addressed via central-pattern aphorism opening every subsystem IKIRO_DRAFT (typology "one constructor, many shapes"; html "DOM is a consumer of the dataspace"; runtime "cascade lifecycle"; paladin "circuitry → variant"; kernels "engine + symbols + instances"; services "manifest declares; provider creates"; modes "traits are the wiring contract"; registry "every entry exports manifest")
- [x] **Ledger profile** (`.ikiro/ledger/modes`): superseded — D8 places trait + wakeup + ledger registries inline in root IKIRO; no separate `.ikiro/ledger/` dir needed. ledger profiles `audit / tour / plan` live in root IKIRO `## traits ### ledger profiles`.

## Content
- [x] **Trait lifecycle**: addressed — root IKIRO_DRAFT.md `### trait arc` traces declarative metadata → functional dispatch across 5 layers (modes / daemon / domain / intent+thread / client) plus 6 honorable mentions of trait-like patterns (Pattern descriptors, tree shape, Faculty[], Profiles, symbol-as-trait, driver-as-trait). When-each-trait-fires-in-what-order-with-what-context still pending — current trait arc explains the *pattern*, not the *temporal sequence*.
- [ ] **Entity relationship diagram**: Textual cardinality map across all entities
- [x] **Circuitry format spec**: addressed — `registry/.ikiro/IKIRO_DRAFT.md` carries the manifest contract + type-specific exports table (domain/ontology/topology/game/tactic/service/datamap/hallucinator/lighthouse/circuit). The runnable circuit shape (runtime/clients/daemons[]/services[]) is also there.
- [ ] **Memory driver reference**: encode/evolve/assess contracts, signal semantics, SQL strength composition

## Testing
- [ ] **Test map**: Single document mapping every test file to what it covers
- [x] **Integration test wishlist**: addressed — redact's testing audit identified inverted pyramid (54 typology > 12 runtime > 10 html > 5 paladin = 5 services > 4 dapper > 1 kernel) and concrete overhang targets. Specific items captured below.
- [ ] **Test parity rule**: every new prototype must have a test file before workpackage marks DONE. BELL, deepgram, elevenlabs all violated this. Distinct from pre-DONE verify (this is about *existence* of tests, that one is about *running* them).
- [ ] **Stale-test sweep before redact**: rename-affected tests must update in the same commit. paladin.test.js (hal257→anthropic), pensieve.test.js (lookup→revelio, born dead Oct 2025), vip.test.js (default exports) have known stale assertions pointing to retired symbols.
- [ ] **DATASET trait test**: bridge from kernels to DB; if it breaks, all topology data fails to load. Add `runtime/tests/mode/dataset-trait.test.js`.
- [ ] **Memory driver parity scenario**: `runtime/tests/scenarios/memory-driver.test.js` helper that runs N tests against any driver implementing the encode/evolve/assess contract. Bayesian/Boolean/COUNTER all pass through it. Currently Bayesian has 36 steps, others have 0 — same contract, parity needed.
- [ ] **Service manifest smoke**: every `service.viva.js` gets a `tests/manifest.test.js` asserting manifest shape (imports + minimal call). Catches typos at minimum cost. deepgram + elevenlabs shipped without one.
- [ ] **Per-trait test files**: `runtime/tests/traits/<NAME>.test.js` per mode trait with stub daemon. Catches trait-body regressions without full integration. CHAOSMONKEY substantial logic, integration-tested only.
- [ ] **Coverage delta in workpackage changelog**: each milestone declares "tests added: X, modified: Y" so testing impact is auditable.

## Method (workpackage hygiene)
- [ ] **Workpackage size cap with auto-split**: workpackages >30KB or >500 lines split when crossing the threshold. Pattern `{base}.{aspect}.workpackage.org` (e.g., longdistance → longdistance.text + longdistance.audio-infra + longdistance.audio-providers + longdistance.vocalized + longdistance.client-session). Would have prevented longdistance.workpackage.org from reaching 115KB.
- [ ] **DONE-day disposal**: STATUS=DONE for >7 days → auto-bak/ at next ikiro/compact. Would have moved effect-saturation, dialogue-verbatim-rename, intent-as-template, conjugation-ontology, pool-prototype before they accumulated as visual debt.
- [ ] **In-flight workpackage registry**: an `active.workpackage.org` (or section) tracking modified-but-uncommitted changes against the workpackage they belong to. Caught 6 orphans during redact stage 4: http.js bare-async-iterator, EM polish (effect-saturation tail), Listen.svelte feedback redesign, bridge.js + pincer panels d/e/f.
- [ ] **Echo manifest pattern**: when a foundational change lands, the workpackage records the cascade as a structured table (e.g., cortex's Hallucinate→Hallucination + WS/Session primitive landings touched 12+ files across typology rename, services rebuild, runtime trait wiring). Surfaces unexpected dependencies before they regress.
- [ ] **Pre-DONE verify gate enforcement**: ikiro/verify documented but unenforced. effect-saturation marked DONE while regression sat in tests (`repository.persist.test.js:348` typo). Make tests-must-pass a precondition for STATUS=DONE flip.

## Discovered this session
- [ ] **dapper IKIRO_DRAFT.md**: dapper subsystem (theming) was added to root IKIRO system map but lacks its own `subsystems/dapper/.ikiro/IKIRO_DRAFT.md`. Out of scope for this redact run (D12 — ikiro folders only at established subsystem level; dapper qualifies but wasn't in original scope). Add in next redact run or as one-off.
