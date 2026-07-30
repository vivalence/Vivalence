# Task: stage present-only Italian verbs, set 5 — 55 lemmas (B1/B2 breadth, final verb wave)

Identical regime to sets 1-4: STAGED DATA ONLY. Never touch the live dataset or generators.

## Read first
1. Schema: .harvest/build-present-verbs.py + entries in .harvest/staged/verbs-present-3.json
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Verb known conventions, EXEMPLIFIED)
3. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js) + .harvest/staged/*.json (NOTE: verbs-present-4.json may be in flight from a sibling — include if present; your lemma list is disjoint from its brief regardless). All under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.

## The work
Write .harvest/staged/verbs-present-5.json — same schema.

Your 55 lemmas EXACTLY:
notare obbedire occupare offendere operare opporre ordinare-check osare osservare ottenere pattinare peggiorare-check permettere-check pescare piegare piovere possedere pregare premere prescrivere presentare prestare-check produrre promuovere proporre proteggere provocare pubblicare puntare raggiungere reagire realizzare recitare recuperare registrare regnare respirare restituire-check ricevere-check riconoscere ridurre riempire rifiutare riflettere rischiare risolvere rispettare ritirare riunire salvare saltare sbagliare scappare scomparire sconfiggere

(Some carry -check: verify against live + staged; if taken, substitute a fresh B1 verb of your choice and document. Final count MUST be 55 distinct fresh lemmas.)

Rules identical: suffix by ending; -urre verbs (produrre→produco/prodotto, ridurre→riduco/ridotto) suffix "ere" regularity "irregular"; opporre/proporre (-orre) → oppongo/propongo, participle opposto/proposto, suffix "ere" irregular; -isc- (obbedire→obbedisco, riunire→riunisco, riempire→riempio NOT -isc- — verify each); piovere impersonal (piove; author natural 3rd-person-centric cells but all 6 present); ottenere→ottengo like tenere; possedere→possiedo; scomparire→scompaio; band b1.
Every example (440) unique vs everything. Natural, form-in-example. Validate + re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-verbs-present-5-report.md
Final message ONLY: STATUS + count + concerns.
