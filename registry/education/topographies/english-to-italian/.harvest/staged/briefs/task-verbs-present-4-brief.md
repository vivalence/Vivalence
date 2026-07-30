# Task: stage present-only Italian verbs, set 4 — 55 lemmas (B1/B2 breadth)

Identical regime to sets 1-3: STAGED DATA ONLY. Never touch the live dataset or generators.

## Read first
1. Schema: .harvest/build-present-verbs.py + entries in .harvest/staged/verbs-present-3.json as exemplars
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Verb known conventions, EXEMPLIFIED)
3. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js — 1000 sentences now live) + .harvest/staged/*.json (all paths under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/)

## The work
Write .harvest/staged/verbs-present-4.json — same schema (lemma/suffix/regularity/band/infinitive/participle/present; rows [learning, known, englishExample, italianExample]; present ordered 1sg…3pl).

Your 55 lemmas EXACTLY:
accompagnare avvertire ammettere annullare apparire appoggiare arrestare arrivederci-NO (not a verb — replace with:) assaggiare assumere attaccare avvicinare bloccare bruciare buttare calmare caricare colpire completare confermare confondere conservare considerare consumare controllare convincere coprire correggere-check(set-3 has it — if taken, substitute) crollare curare dedicare difendere dirigere distruggere dubitare esistere esprimere evitare fuggire girare gettare guarire immaginare indicare inserire insistere interrompere lanciare lasciare legare liberare limitare meritare mescolare muovere

(That list contains 55 tokens including two marked instructions: replace arrivederci-NO with assaggiare-adjacent verb of your choice NOT already staged/live; check correggere against set-3 and substitute if taken. Final count MUST be 55 distinct fresh lemmas — run your blocking check.)

Rules identical: suffix by ending; -isc- verbs (colpire→colpisco, guarire→guarisco, inserire→inserisco) = regular; irregulars verified cell-by-cell (apparire→appaio, muovere→muovo regular-ish participle mosso, assumere→assunto, distruggere→distrutto, dirigere→diretto, coprire→coperto, esprimere→espresso); band a2/b1.
Every example (8 × 55 = 440) unique vs everything. Natural, form-in-example. Validate + re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-verbs-present-4-report.md
Final message ONLY: STATUS + count + concerns.
