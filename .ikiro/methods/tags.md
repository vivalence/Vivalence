# tags — the internal semantic (AFINN-shaped, 128 tags, 8×16)
<!-- writer: agent (human-gated; valences beef-curated like the family taxonomy) · limit: 200 lines -->

Modeled on `@stdlib/datasets/afinn-111` — Finn Årup Nielsen's valence lexicon: a flat list of `[word, integer −5..+5]`, functional because consumers FOLD it (sum = sentiment). Same design here: **every tag carries a signed valence; arithmetic over tags drives the machinery.** Tag form `#cluster/name` (Obsidian nested-tag native, grep-able). One valence rule: **how the tagged thing shifts the flywheel accumulator** — negative = discipline-debt, positive = proof/health, 0 = pure classification.

## the folds (what makes it functional)

```
flywheel trigger    Σ|v| over negative tags since last flywheel ≥ 20   (weighted upgrade of "≥5 callouts")
callout severity    the callout's #fail/ tag valence — family: field ≡ #fail/<name>, one system
session score       fold the compact's tag-line: Σv                    (a session's signed integer)
escalation weight   |v|·occurrences per family — highest product = next rung candidate
retrieval           grep "#fail/assume-dont-verify" compacts/ zettelkasten.md   (the graph's other axis)
```

## fail/ — failure families (valence = severity; the Scoreboard's key axis)

| tag | v | tag | v |
|---|---|---|---|
| #fail/vcs-write | −5 | #fail/invented-state | −3 |
| #fail/fabricated-api | −4 | #fail/manifest-extension | −3 |
| #fail/assume-dont-verify | −4 | #fail/date-discipline | −2 |
| #fail/deleted-beef-content | −4 | #fail/strawman-constraint | −3 |
| #fail/unverified-done | −4 | #fail/machinery-for-nonproblem | −3 |
| #fail/consumer-side-patch | −3 | #fail/premature-completion | −3 |
| #fail/imperative-reflex | −3 | #fail/scope-overbuild | −2 |
| #fail/yap-wrong-artifact | −3 | #fail/stale-map | −2 |

## sig/ — beef's control tokens (valence 0: syntax, not sentiment)

| tag | v | tag | v |
|---|---|---|---|
| #sig/go | 0 | #sig/probe | 0 |
| #sig/blast | 0 | #sig/hypothesis | 0 |
| #sig/stop | 0 | #sig/open-field | 0 |
| #sig/wait | 0 | #sig/critical-pass | 0 |
| #sig/another | 0 | #sig/sanity-cut | 0 |
| #sig/amen | 0 | #sig/fader | 0 |
| #sig/go-meta | 0 | #sig/delegation | 0 |
| #sig/retard | 0 | #sig/edit-as-spec | 0 |

## vale/ — the affect register (the AFINN homage: beef's words, scored)

| tag | v | tag | v |
|---|---|---|---|
| #vale/beast | +5 | #vale/hmm | −1 |
| #vale/love-it | +4 | #vale/ish | −1 |
| #vale/insane-good | +4 | #vale/overcomplex | −2 |
| #vale/noice | +3 | #vale/miss | −2 |
| #vale/nifty | +3 | #vale/frustrated | −3 |
| #vale/big-actually | +3 | #vale/repeated-correction | −3 |
| #vale/amen-glow | +2 | #vale/rage-caps | −4 |
| #vale/clean | +1 | #vale/trust-damage | −5 |

## trig/ — connoisseur triggers (valence = convulsion grade)

| tag | v | tag | v |
|---|---|---|---|
| #trig/cata-ana | +5 | #trig/discriminator-data | +3 |
| #trig/code-as-data | +4 | #trig/self-priming | +3 |
| #trig/fold | +4 | #trig/lazy-suspension | +3 |
| #trig/one-core-thin-cases | +4 | #trig/totality | +2 |
| #trig/algebra-named | +4 | #trig/zero-ceremony | +2 |
| #trig/multimethod | +3 | #trig/naming-true | +2 |
| #trig/recursion-mirrors | +3 | #trig/effect-over-model | +2 |
| #trig/closure-object | +3 | #trig/reveal-not-hide | +5 |

## phase/ — artifact lifecycle (valence = health)

| tag | v | tag | v |
|---|---|---|---|
| #phase/proven | +4 | #phase/parked | −1 |
| #phase/landed | +3 | #phase/blocked | −2 |
| #phase/verified | +3 | #phase/stale | −2 |
| #phase/green | +2 | #phase/drift | −3 |
| #phase/design | +1 | #phase/rule-failure | −4 |
| #phase/wip | 0 | #phase/dead | −1 |
| #phase/seed | 0 | #phase/superseded | 0 |
| #phase/deferred | 0 | #phase/extinct | +5 |

## act/ — work verbs (valence = evidential weight of the act)

| tag | v | tag | v |
|---|---|---|---|
| #act/prove | +3 | #act/design | +1 |
| #act/blast-bracket | +3 | #act/research | +1 |
| #act/live-validate | +3 | #act/sweep | +1 |
| #act/demo | +3 | #act/compact | +1 |
| #act/refute | +2 | #act/flywheel | +2 |
| #act/ground | +2 | #act/tangle | +1 |
| #act/verify | +2 | #act/orient | 0 |
| #act/land | +2 | #act/propose | 0 |

## art/ — artifact kinds (0: classification)

| tag | v | tag | v |
|---|---|---|---|
| #art/quest | 0 | #art/hook | 0 |
| #art/compact | 0 | #art/shard | 0 |
| #art/callout | 0 | #art/koan | 0 |
| #art/memory | 0 | #art/scoreboard | 0 |
| #art/orb | 0 | #art/manual | 0 |
| #art/zettel | 0 | #art/totem | 0 |
| #art/law | 0 | #art/lexeme | 0 |
| #art/ritual | 0 | #art/persona | 0 |

## realm/ — where (0: classification; the four packages + containers)

| tag | v | tag | v |
|---|---|---|---|
| #realm/vivalence | 0 | #realm/kajuit | 0 |
| #realm/education | 0 | #realm/ghost | 0 |
| #realm/playground | 0 | #realm/dapper | 0 |
| #realm/simulation | 0 | #realm/drapes | 0 |
| #realm/typology | 0 | #realm/testament | 0 |
| #realm/paladin | 0 | #realm/docs | 0 |
| #realm/runtime | 0 | #realm/ikiro | 0 |
| #realm/registry | 0 | #realm/web | 0 |

## usage

- **callouts**: `family:` becomes the `#fail/` tag (one system, no parallel taxonomy). Severity = its valence.
- **compacts**: close with one tag-line (`#realm/… #act/… #phase/… #vale/…`) — the session's signed fold.
- **quests**: `#phase/` in the STATUS header region; `#realm/` for home.
- **scoreboard**: escalation priority = |v| × occurrences.
- clusters are 16-slotted; a new tag EVICTS or waits — 128 is the budget ([[ontology]] budgets rule). Valences: beef curates, like the taxonomy.
