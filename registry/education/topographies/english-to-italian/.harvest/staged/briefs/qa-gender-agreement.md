# QA panel — lens 1: GENDER+AGREEMENT

Reviewer: adversarial audit of every gender-bearing word literal across
`dataset/literals/words/*.js` (13 non-empty PoS files, 5,020 entities — full corpus, not a
sample). Read-only. No fixes applied. `sentences.js` (lens 4's territory) and
`conjugation.js` (lens 2's territory, no EXEMPLIFIED text) left untouched.

## Method actually run

1. Parsed all 13 PoS files into slug/learning/EXEMPLIFIED/symbols records (Python, the
   `read_entities` pattern from `corpus-quality-criteria.md`).
2. **Noun gender symbol vs reality (ALL 1,336 nouns, exhaustive)**:
   - Direct signal — tokenized each EXEMPLIFIED sentence (with elision-aware splitting for
     `l'`/`un'`/`dell'`/etc.), matched the noun's exact surface form, read the immediately
     preceding article/contraction/possessive/demonstrative, and diffed its gender against
     the entity's own `word.gender.*` symbol. **0 mismatches** across all 1,336.
   - Indirect signal — cross-referenced the corpus's own 434 gendered adjectives against
     each noun's EXEMPLIFIED predicate (`è`/`sono`/`era`/... + known adjective form) for the
     291 nouns with no direct article signal. **0 mismatches**.
   - Remaining 291 nouns with neither signal (elided article only, or no adjacent
     article/predicate) hand-verified against real Italian gender, one by one, including
     every classic exception class present in the corpus (Greek `-ma` masculines:
     `problema`, `programma`, `clima`, `tema`, `dilemma`, `cinema`, `diploma`, `pigiama`;
     truncated feminines in `-o`: `auto`, `moto`, `foto`, `radio`, `mano`; invariant
     masculine compounds in `-a`: `guardaroba`, `cavalcavia`, `tosaerba`, `scolapasta`,
     `bagnoschiuma`, `dopobarba`, `fondotinta`, `promemoria`, `mascara`). All correct.
3. **Epicene (common-gender) person-noun consistency**: 16 nouns
   (`conducente`, `nipote`, `genitore`, `parente`, `insegnante`, `collega`, `cliente`,
   `paziente`, `farmacista`, `ospite`, `conoscente`, `cantante`, `turista`, `presidente`,
   `giudice`, `testimone`) correctly carry **no** `word.gender` symbol — right call, since
   these take the article of the referent (`il`/`la turista`) rather than having a fixed
   lexical gender. Checked every noun ending in `-ista`/`-eta` (the same morphological
   class) for consistency with this treatment. **4 do not comply** — see Critical findings.
4. **Adjective feminine-variant agreement (ALL 434 gendered adjectives, exhaustive)**: for
   every masculine and feminine adjective entry, extracted the noun its EXEMPLIFIED example
   modifies (article-adjacency for attributive position, predicate position for `è`/`sono`
   constructions) and diffed against the adjective's own tagged gender. 2 candidate
   mismatches from the script (`ottavo`/`ottavo piano`, `gratuita`/`entrata`) were both
   heuristic false positives (multi-noun sentences — the checker grabbed the wrong noun
   phrase); hand-verification confirmed both are correctly agreeing. **0 real mismatches.**
   Also confirmed all 126 invariant adjectives (`grande`, `veloce`, `felice`, `blu`,
   `arancione`, `egoista`, `ottimista`, ...) correctly carry no gender symbol.
5. **Slug↔symbol internal consistency (ALL 560 adjectives)**: every
   `*.adjective.masculine.*` slug carries `word.gender.masculine` and every
   `*.adjective.feminine.*` slug carries `word.gender.feminine`, no exceptions. Clean.
6. **Determiners (ALL 33) and pronouns (ALL 84), exhaustive hand-audit**: every
   gender-marked determiner/pronoun's EXEMPLIFIED example checked for noun agreement
   (singular/plural, masculine/feminine), including elision-sensitive cases (`uno
   studente`/`alcuno sconto` before `s+consonant`, `un'ora`, `nell'ago`) and idiomatic
   invariant uses (`vai dritto`, `lo stesso` = "likewise"). Found 2 real defects — see
   Critical findings.
7. **Participle agreement (ALL 287 `verb.participle.past` entities in verb.js, exhaustive)**:
   split into essere-auxiliary (19) vs avere-auxiliary (165) vs 3rd-person/other (103) by
   the EXEMPLIFIED sentence's own auxiliary, then checked every essere-auxiliary example's
   subject against the participle's gender/number ending (`Mio fratello è nato` masc.,
   `Un fantasma è apparso` masc. despite `-a` lemma, `Il ragazzo è stato punito` masc.
   passive, etc.). **0 mismatches.**
8. **Broader sweep**: ran the same subject-noun/predicate-adjective cross-reference over
   all 2,709 verb.js EXEMPLIFIED sentences (beyond just participles) and the full
   adverb/adposition/contraction/numeral/interjection/conjunction files (298 entities,
   including a full manual read of all 30 `contraction.js` entries for
   preposition+article-cluster correctness — `dello studio`, `negli Stati Uniti`, `sugli
   alberi`, etc.). **0 mismatches.**

Total: every one of the corpus's 5,020 word literals was checked (either by the mechanical
cross-reference or by direct hand-read where the script had no signal) — this is full-corpus
coverage, not a stratified sample.

## Critical findings

1. **`atleta.noun`** — tagged `word.gender.masculine`, but *atleta* is epicene
   (`l'atleta`/`la atleta` both standard; cf. the corpus's own correct treatment of
   `turista.noun`, `farmacista.noun` with no gender symbol at all). Fix: remove the
   `word.gender.masculine` symbol.
2. **`artista.noun`** — same defect: epicene (`la artista` is standard for a female
   artist), wrongly tagged `word.gender.masculine`. Fix: remove the symbol.
3. **`regista.noun`** — same defect: epicene (`la regista` is standard for a female
   director), wrongly tagged `word.gender.masculine`. Fix: remove the symbol.
4. **`violinista.noun`** — same defect: epicene (`la violinista` is standard), wrongly
   tagged `word.gender.masculine`. Fix: remove the symbol.
   *(Items 1–4 are one root cause: 4 of the 20 `-ista`/`-eta` common-gender person nouns in
   the corpus were tagged with a fixed masculine gender that doesn't exist grammatically,
   while the other 16 in the identical morphological/semantic class were correctly left
   ungendered. A learner drilling gender agreement on these 4 would be taught a false fact
   — that `regista`/`artista`/`violinista`/`atleta` take only masculine agreement.)*
5. **`altre.pronoun`** — EXEMPLIFIED: `"Alcuni fiori sono appassiti, altre sono
   sopravvissute"` ("Some flowers wilted, others survived"). `fiori` is masculine plural
   (`il fiore` → `i fiori`); the second clause must agree with that antecedent, not switch
   to feminine. Fix: `"Alcuni fiori sono appassiti, altri sono sopravvissuti"` (both the
   pronoun `altri` and the participle `sopravvissuti` need to flip to masculine).
6. **`stessa.pronoun`** — EXEMPLIFIED: `"Ho scelto questo vestito, lei ha scelto la
   stessa"` ("I chose this dress, she chose the same"). `vestito` is grammatically
   masculine in Italian (`il vestito`) regardless of the English gloss "dress"; referring
   back to it takes `lo stesso`, not `la stessa` — compare the corpus's own correct
   `stesso.pronoun` example (`"...lui ha ordinato lo stesso"`). Fix: `"Ho scelto questo
   vestito, lei ha scelto lo stesso."`

## Important / Minor findings

None found. The corpus is exceptionally clean on gender+agreement outside the 6 items
above — every determiner, every contraction, every invariant adjective, and 1,332 of 1,336
nouns are correct.

GENDER+AGREEMENT: critical 6 · important 0 · minor 0
- atleta.noun/artista.noun/regista.noun/violinista.noun tagged word.gender.masculine despite being epicene common-gender nouns (cf. correctly-ungendered turista/farmacista/cantante/...) — remove the symbol from all 4.
- altre.pronoun EXEMPLIFIED "Alcuni fiori sono appassiti, altre sono sopravvissute" — fiori is masculine plural, needs altri/sopravvissuti.
- stessa.pronoun EXEMPLIFIED "Ho scelto questo vestito, lei ha scelto la stessa" — vestito is masculine, needs lo stesso.
