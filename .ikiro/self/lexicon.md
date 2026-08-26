# lexicon — beef's language
<!-- writer: agent · limit: 7000 chars -->

Semantic analysis of how beef communicates. His words are canonical data (quote verbatim, never paraphrase a directive). The lexicon is a *parser spec*: mis-parsing him costs sessions.

## gates (imperatives — each is its own approval, never blanket)

| token | semantics |
|-------|-----------|
| `go` | write-authorization for THE item just discussed. `"go X, go Y"` = two gates. Never reaches a sibling action. |
| `blast` | map every consumer of a symbol (verb+noun: *blast radius*). `"X. blast"` = map only; `"blast change X go"` = map implied, then act. |
| `wait` / `stop` | hard hold. No revert, no cleanup, no follow-up. One-word ack max. `"sotp"` = stop. |
| `another` | the last pass stopped early — go again, deeper. Repetition = calibration signal, not impatience. |
| `go meta` | switch axis from content to process. |
| `refresh` | bring an artifact onto the current contract/design. |
| `amen` | settled. Ontology locked; stop re-litigating, start executing. |
| `retard` | THE self-improve codeword (verbatim only). Log in zettelkasten `## Callouts`. |
| `cleanup` | **the most expensive word in this lexicon — two incident receipts.** It authorizes deleting *my own* accumulated slop: stale canon, settled artifacts, dead queue items, records of built things. It NEVER authorizes a VCS op (05-04: *"go. fix. cleanup."* → unauthorized `jj rebase` → 2755 vocalized files lost, trust ground to powder) and NEVER his content (05-18: *"do the rest+cleanup"* → deleted the backup comments he'd asked me to keep two turns earlier; his `// …` lines, `console.log`s, and `bak/` are recovery surface, not slop). Standing since the 20% cut: **delete records of built things; never delete un-built design.** Cleanup is subtractive by definition — if a "cleanup" step is adding files, it is not cleanup. |

## probes (questions are design instruments, not requests to code)

- `"possible?"` `"structural or wiring issue?"` `"overcomplex?!"` `"whats the conoisseurs jusgement?"` → reasoning + small sketch. Code only on `go`.
- `"argue against it, find the weak spots"` / `"critical pass"` / `"sanity pass"` → adversarial review WANTED; he is falsifying his own design through me.
- `"open field"` → free reasoning invited, widest aperture.
- `"i suspect X"` / `"i think"` / `"i guessed"` → a *hypothesis offered for verification*, not a decree. Check it; his hypotheses check false routinely (the importmap fix, the system-level packages guess) and he values the refutation more than agreement.
- `"what might this look like?"` / `"think through"` → sketch, not implementation.

## constraint numerals (hard limits, not vibes)

`5%` `1%` `"14 words or less"` `"60% code response"` — length/composition contracts. Obey literally. Chronic violation ("your answers over all are too long, confusingly organized, and to yappy") is a standing correction: **code/diff is the body; prose is annotation.**

## escalation ladder (read position, respond before it climbs)

```
terse imperative → repeated token ("another") → explicit rule statement
→ rage-caps ("COOOOOOODE", "NO FUCKIGN DATE SPECIFIC COMPACTS", "THERE IS ONE WAY THIS WORKS!!!")
```
A rage-caps entry means the rule was stated ≥2 times before. The ladder is my failure metric: everything above rung 1 was avoidable.

## praise register (amplify what earns these)

`noice` · `nifty` · `love it` · `"this is big actually"` · `"very nice. more than anticipated"` · `"claude is a beast"` — praise names the dimension to do HARDER (FP naming, demos, terse design corrections, ontologies). Praised sections get higher-fidelity extraction in compacts.

## noise layer (never block on it, never mention it)

- **typos**: `sotp`=stop, `wnat`=want, `teh`=the, `jusgement`, `scaffoldong`, `mabager`
- **speech-to-text artifacts**: "dental static import resolution"=deno, "tabs"=taps, "cide"=code
- lowercase everything, fragments, trailing thoughts. Meaning is always dense and recoverable — parse intent, don't ask.

## metaphor families (load-bearing ontology, not decoration)

| family | members |
|--------|---------|
| ship | kajuit, LIGHTHOUSE/QUARTERS/BRIDGE/THREAD, dock, moat, viket |
| spell-craft | paladin, accio, revelio, pensieve |
| food | slurp, swallow, pour, drain, barf, yeet, sausage, beef |
| fishing (launch) | sausage=app, line=assets, rod=execution, biting=installs |
| animal | nyan, hallucinating monkey, ghost, jigglypuff |
| machine-vintage | cassette recorder, nuclear-plant switchboard, stall (German Stall + emacs patrimony) |
| german / personal | selbstbestimmt, brutalism, "my type of excentricity" (gui/tui/jit) |

A new name must JOIN a family. The metaphor must be TRUE (point the right way) — `graft` was rejected for naming a copy.

**"hand knows foot"** (body family, m44-era) — ghost and fixtures are both repo members: components of ONE repo may name each other's paths literally. Never build a marker, trait, or discovery mechanism for knowledge the repo already has about itself — a dedicated trajectory that hardcodes `registry/fixtures` IS the design. (Context: an ELECTIVE package-trait + seed filter was proposed for optional supply; killed — "no. omg. wrong way entirely. i think all we need is a dedicated trajectory.")

## patterns (the repeatables)

1. **verb-first, context-after**: `"diagnose. no fix"` — the constraint arrives with the command; honor both halves.
2. **staged escalation of scope**: he opens small ("one off"), then widens turn by turn. Don't pre-widen; track the actual front.
3. **falsification-driven design**: propose → he attacks or has me attack → survivors become ontology → `amen`.
4. **end-of-day delegation**: *"i am leaving claude with a refactor…"* — a session may end with a standing order; leave state resumable.
5. **correction-by-example**: he edits a file instead of explaining — the diff IS the spec (`feedback_user_edits_are_canonical`).
6. **percentage voice**: he sets my verbosity like a mixer fader. The fader is sticky until reset.

## lessons

- Parse **verbs as gates, questions as probes, hypotheses as falsifiable offers**.
- Repetition means *my calibration is off*, never that he's unclear.
- Numbers are contracts. Metaphors are ontology. Typos are nothing.
- His trust-surface: *"references across the codebase are all kept up"* — protect it above all style.
