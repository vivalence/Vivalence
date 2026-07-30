# Report: verbs-present-4 (set 4, 55 lemmas)

## Output
`.harvest/staged/verbs-present-4.json` — 55 lemma entries, 440 rows total (2 fixed + 6 present cells × 55), 880 example sentences (440 English + 440 Italian).

## Instruction resolution
The brief's raw list contained 55 tokens with two marked instructions, resolving to 53 fixed lemmas + 2 substitutions:
- `arrivederci-NO` (not a verb) replaced with **masticare** ("to chew") — assaggiare-adjacent (tasting/eating domain), distinct from the `assaggiare` already present later in the same list (using assaggiare itself would have duplicated it).
- `correggere` checked against blocking set — confirmed already staged/live (verbs-present-3, band b1) — substituted with **verificare** ("to verify"), same domain (checking/confirming) as correggere.

Final lemma count: 55 distinct, all confirmed fresh against live `verb.js` (177 lemmas) + staged verbs-present-1/2/3 (161 lemmas, all subsumed in the 177 live).

## Regularity/suffix decisions
Only `apparire` marked `irregular` (present-tense boot alternation: appaio/appari/appare/appariamo/apparite/appaiono). All others `regular`, including verbs with irregular past participles (assumere→assunto, distruggere→distrutto, dirigere→diretto, coprire→coperto, esprimere→espresso, ammettere→ammesso, confondere→confuso, convincere→convinto, difendere→difeso, interrompere→interrotto, muovere→mosso) — consistent with set-3 precedent where `regularity` tracks present-tense conjugation, not participle idiosyncrasy. `-isc-` infix applied to colpire/guarire/inserire per brief; avvertire/coprire/fuggire/apparire correctly left without `-isc-`.

Suffix split: 36 `-are`, 12 `-ere`, 7 `-ire`. Band split: 25 `a2`, 30 `b1`.

## Blocking checks (programmatic, run before authoring and re-run after write)
Blocking sets were built from: live `dataset/literals/words/*.js` + `sentences.js`, and every file currently in `.harvest/staged/*.json`. Note: mid-task the connection dropped and resumed; on resume, several sibling files had landed in `.harvest/staged/` from other concurrent tasks (adjective-batch-4, noun-batch-4 through 8, mixed-fill) — blocking sets were rebuilt fresh (not reused from stale scratch state) to include these before the final write, and re-verified again immediately after writing to catch anything that landed during the write itself.

- Lemma collisions: none (0/55).
- Example-sentence collisions (exact string match, English or Italian) against the entire corpus: none (0/440 rows).
- Internal duplicate examples within the file: none.
- Schema check: every row has 4 fields, present arrays have exactly 6 cells in 1sg/2sg/3sg/1pl/2pl/3pl order, suffix/regularity/band values all valid.
- EXEMPLIFIED rule (learning form must appear verbatim in its own Italian example): verified for all 440 rows. Two failures were caught and fixed during authoring — `apparire` and `esistere` participle examples originally used feminine subjects (luce, città) producing agreement variants (apparsa, esistita) that didn't match the canonical masculine-singular participle form; rewritten with masculine subjects (fantasma, tempio) to match set-3's essere-auxiliary convention.

## Concerns / judgment calls
- English glosses for a few verbs required a specific-sense choice to avoid redundancy with other lemmas already using "throw" (buttare→"to throw away", gettare→"to throw", lanciare→"to launch"; caricare→"to charge" rather than "to load"; guarire→"to recover" rather than "to heal", to fit natural intransitive example sentences).
- No VOCALIZED/RANKED traits included — matches verbs-present-3 exemplar shape (staged files carry only TRANSLATED-equivalent tuples; those traits are presumably added at a later build/audio stage).
- Did not touch live dataset, generators, or any other staged file. No git/jj commands run.
