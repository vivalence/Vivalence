# Task: stage present-only Italian verbs, set 2 — 55 lemmas

Identical regime to set 1: STAGED DATA ONLY, JSON file, never touch the live dataset or generators.

## Read first
1. Data format: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/build-present-verbs.py + 2-3 VERBS entries in .harvest/build-verbs.py for style
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Verb known conventions, EXEMPLIFIED)
3. Example-dupe targets: dataset/literals/ (all files) + sibling staged .harvest/staged/*.json (ESPECIALLY verbs-present-1.json if it exists — its author is working in parallel; if absent, your uniqueness duty still holds vs everything else)

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/verbs-present-2.json — same schema as set 1 (rows [learning, known, englishExample, italianExample]; present rows ordered 1sg 2sg 3sg 1pl 2pl 3pl).

Your 55 lemmas EXACTLY (do not add or substitute):
iniziare continuare decidere chiedere rispondere raccontare spiegare mostrare invitare incontrare salutare ringraziare telefonare mandare ricevere regalare vendere offrire ordinare cucinare tagliare lavare pulire preparare guidare salire scendere cadere alzare toccare indossare riposare preferire scegliere conoscere succedere significare diventare pesare misurare contare aggiungere togliere accendere spegnere rompere riparare costruire dipingere disegnare suonare vincere firmare prenotare noleggiare attraversare

Rules identical to set 1:
- suffix by ending; regularity irregular where present is irregular (salire→salgo, scegliere→scelgo, uscire-class watch; succedere impersonal); -isc- (pulire→pulisco, preferire→preferisco, costruire→costruisco) = "regular". band a1/a2 judgment.
- Every form correct standard Italian — verify each cell.
- knowns per criteria conventions; impersonals (succedere, significare) natural third-person examples but all cells present.
- EVERY example unique (within file + vs live + vs sibling staged). Natural, form-in-example, agreement correct.
- Validate: python3 -c "import json; d=json.load(open('<path>')); print(len(d), all(len(v['present'])==6 for v in d))"

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-verbs-present-2-report.md
Final message ONLY: STATUS + count + concerns.
