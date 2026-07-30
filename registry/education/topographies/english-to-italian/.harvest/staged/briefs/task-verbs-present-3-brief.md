# Task: stage present-only Italian verbs, set 3 — 50 lemmas (B1 breadth)

Identical regime to sets 1-2: STAGED DATA ONLY, JSON file. Never touch the live dataset or generators.

## Read first
1. Schema consumer: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/build-present-verbs.py + entries in .harvest/staged/verbs-present-2.json as style exemplars
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Verb known conventions, EXEMPLIFIED)
3. Example-dupe targets (programmatic blocking sets FIRST + re-verify LAST): dataset/literals/ (all files) + .harvest/staged/*.json (both under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/)

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/verbs-present-3.json — same schema (rows [learning, known, englishExample, italianExample]; present rows ordered 1sg 2sg 3sg 1pl 2pl 3pl; fields lemma/suffix/regularity/band/infinitive/participle/present).

Your 50 lemmas EXACTLY:
promettere permettere sorridere piangere ridere gridare correggere migliorare peggiorare aumentare diminuire dividere unire appartenere organizzare partecipare festeggiare augurare abbracciare baciare sposare nascere morire crescere invecchiare dimagrire ingrassare guadagnare spendere risparmiare prestare restituire rubare nascondere scoprire dimostrare tradurre pronunciare ripetere descrivere discutere litigare scherzare mentire giurare consigliare suggerire proibire obbligare riuscire

Rules identical to prior sets:
- suffix by ending (tradurre → "ere" is WRONG: tradurre is a contracted -urre verb; classify suffix "ere" with regularity "irregular" and note it in the report — traduco/traduci/traduce/traduciamo/traducete/traducono, participle tradotto). riuscire conjugates like uscire (riesco…). morire → muoio/muori/muore/moriamo/morite/muoiono, participle morto. nascere → participle nato. piangere → pianto. ridere/sorridere → riso/sorriso. crescere → cresciuto. dimagrire/ingrassare check -isc-: dimagrisco yes (-isc-, regular), suggerire/proibire -isc-. mentire: mento (non-isc). band mostly a2/b1.
- Every form correct standard Italian, verified cell by cell.
- knowns per criteria conventions; EVERY example (8 × 50 = 400) unique vs everything. Natural, form-in-example.
- Validate JSON + final programmatic dedup re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-verbs-present-3-report.md
Final message ONLY: STATUS + count + concerns.
