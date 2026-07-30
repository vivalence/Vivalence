# Review: Italian adverb batch 2 — 80 literals

Reviewed `.harvest/staged/adverb-batch-2.json` against the brief, corpus-quality-criteria.md (Entity Shape/TRANSLATED/EXEMPLIFIED), `dataset/symbols/structural.js`, the live 42-entry `dataset/literals/words/adverb.js`, and all sibling `.harvest/staged/*.json` batches.

## Mechanical (script-verified, all pass)

- JSON parses cleanly, UTF-8, no `\u` escapes, no comments. Exactly 80 entities.
- All 80 `learning` forms are single words (no spaces).
- Slug format `<form>.adverb` holds for all 80; slug exactly equals `<learning>.adverb` in every case.
- `word.lemma.<form>` matches `learning` exactly in all 80.
- Form-in-example law: `learning` appears (case-insensitively) in the `EXEMPLIFIED.learning` sentence for all 80.
- No internal duplicates: slugs, `EXEMPLIFIED.known`, `EXEMPLIFIED.learning` — all unique across the 80.
- No collisions (slug / known example / learning example) against any of the 14 live `dataset/literals/words/*.js` files, including the live 42-entry `adverb.js`.
- No collisions against sibling staged batches (`adjective-batch-1/2`, `noun-batch-1/2/3/4`).
- Every non-universal symbol slug (`functional.*`, `domain.*`) traces to a real entry in `dataset/symbols/structural.js`. No illegal symbols.
- `traits: ["TRANSLATED","EXEMPLIFIED"]` uniform across all 80, matching sibling batch convention.
- No uppercase `learning` values, no `known == learning`, no Italian diacritics leaking into `known` fields.

## Linguistic (adversarial native-Italian pass)

- All 27 `-mente` manner adverbs correctly formed, including the `-e`-ending-adjective class that drops the vowel before `-mente` (facile→facilmente, naturale→naturalmente, particolare→particolarmente, gradualmente, principalmente, praticamente-class) versus the class that keeps it (semplice→semplicemente, dolce→dolcemente). No misspellings found in any of the 80 forms.
- Every example sentence is grammatical, natural, and semantically faithful to its English gloss. Checked all 80 by hand — no forced/unnatural constructions, no gender-agreement errors, no register mismatches (register-appropriate literary items like `assai`, `frattanto` correctly held at b1).
- Part-of-speech honesty (the brief's specific worry) holds: `allora` ("Allora, cosa facciamo adesso?" = "So, what do we do now?"), `comunque` ("Comunque, ci riproveremo" = "Anyway, we'll try again"), `dunque`, `insomma`, `infine` are all used as genuine discourse-adverbials/sentence-openers in their examples, not as subordinating/coordinating conjunctions.
- Near-synonym pairs (`veramente`/`davvero`/`proprio`, `certamente`/`ovviamente`, `intanto`/`frattanto`, `ovunque`/`dappertutto`) are legitimate distinct headwords with distinct, non-copy-pasted examples — not accidental duplication.

## Important

1. **`functional.aspect` semantically overloaded by ~7x.** Live `adverb.js` uses `functional.aspect` for exactly 3 tightly-grammaticalized aspect particles (`già`, `ancora`, `sempre`) — matching `structural.js`'s own description verbatim ("Aspect markers — già, ancora, sempre"). This batch adds **18 more** entries to that symbol: all 15 frequency-family adverbs (`spesso`, `raramente`, `talvolta`, `solitamente`, `generalmente`, `frequentemente`, `occasionalmente`, `abitualmente`, `regolarmente`, `costantemente`, `continuamente`, `quotidianamente`, `normalmente`, `sporadicamente`, `periodicamente`) plus `finalmente`, `improvvisamente`, `appena`. That takes the symbol from 3 items to 21. Frequency adverbs and già/ancora/sempre are pedagogically and syntactically different classes — già/ancora/sempre have fixed compound-tense placement rules (between avere/essere and the participle) that frequency adverbs don't share. Since `functional.aspect` drives symbol-filtered drills (per corpus-quality-criteria.md: "Symbols drive... filtering exercises"), any future "aspect" exercise now surfaces a semantically heterogeneous 21-item set instead of the tight 3-item grammatical cluster it currently teaches. No dedicated `functional.frequency` symbol exists in `structural.js` today, so the implementer's choice is defensible as a stopgap, but it silently changes symbol semantics for an existing live category — worth a design decision, not a rubber stamp.
2. **Family-size deviation from brief.** Brief specified `-mente manner ~30 / frequency ~15 / sequence ~15 / attitude ~12 / place ~8`. Delivered: `27/15/15/15/8` — attitude/discourse expanded 12→15 (absorbing `insomma`, `ecco`, `davvero`, `proprio`, `assai`, `beh`, `cioè`, `dunque`, which do verbatim match `structural.js`'s own `functional.discourse`/`intensifier`/`filler` example lists) at the expense of manner (30→27). The report discloses this explicitly with sound reasoning; total is still exactly 80 and every Entity Shape requirement is met, so this is a scope judgment call rather than a defect, but it is a deviation from the brief's numeric split and should be confirmed rather than silently accepted.

## Minor

1. **Inconsistent sequence-adverb symbol split.** `infine` ("lastly") and `innanzitutto` ("first of all") are tagged `functional.discourse`, while `successivamente` ("subsequently") — the same ordinal/sequence-organizer semantic role — is tagged `functional.time`. Pick one convention for this discourse-sequencer sub-class.
2. Colloquial, easy fillers `beh` and `cioè` are pinned to `b1` alongside more genuinely advanced/literary items (`assai`, `frattanto`); arguable they're a2-appropriate given how early learners encounter them in spoken Italian. Judgment call, not an error.
3. No `RANKED` trait — intentional per brief's binding-doc scope (Entity Shape/TRANSLATED/EXEMPLIFIED only) and consistent with sibling batches; flagged only because the report itself raises it as a question for a later curation pass.

## Not found

No dupes (internal, live, or sibling-staged), no illegal symbols, no malformed JSON, no spelling errors, no faithfulness violations, no gender-agreement errors, no comments, no PII, no multi-word forms, no slug/lemma/form mismatches.
