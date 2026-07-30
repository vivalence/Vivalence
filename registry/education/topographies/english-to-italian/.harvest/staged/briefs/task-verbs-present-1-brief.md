# Task: stage present-only Italian verbs, set 1 — 55 lemmas

You author STAGED DATA ONLY (a JSON file). You never touch the live dataset or any generator.

## Read first
1. Data format + conventions: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/build-present-verbs.py (the consumer of your file — read its schema expectations) and 2-3 existing VERBS entries in /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/build-verbs.py for gloss/example style
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Verb known conventions, EXEMPLIFIED)
3. Example-dupe check targets: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/ (all files) + sibling staged /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/*.json

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/verbs-present-1.json — JSON array, one object per lemma:
```json
{
  "lemma": "mangiare", "suffix": "are", "regularity": "regular", "band": "a1",
  "infinitive": ["mangiare", "to eat", "I want to eat something", "Voglio mangiare qualcosa"],
  "participle": ["mangiato", "eaten", "Have you already eaten?", "Hai già mangiato?"],
  "present": [
    ["mangio", "I eat", "...", "..."],
    ["mangi", "you eat", "...", "..."],
    ["mangia", "he/she eats", "...", "..."],
    ["mangiamo", "we eat", "...", "..."],
    ["mangiate", "you all eat", "...", "..."],
    ["mangiano", "they eat", "...", "..."]
  ]
}
```
(rows are [learning, known, englishExample, italianExample]; the 6 present rows are ALWAYS in order 1sg 2sg 3sg 1pl 2pl 3pl)

Your 55 lemmas EXACTLY (do not add or substitute):
mangiare bere prendere mettere vedere sentire capire leggere scrivere aprire chiudere uscire arrivare partire tornare entrare restare portare comprare pagare costare cercare trovare perdere guardare ascoltare chiamare amare aiutare lavorare studiare imparare insegnare giocare cantare ballare camminare correre nuotare viaggiare visitare abitare vivere aspettare pensare ricordare dimenticare sperare sembrare piacere servire mancare usare provare cambiare

Rules:
- suffix = are|ere|ire by infinitive ending. regularity = irregular where the present is irregular (bere→bevo, uscire→esco, piacere→piaccio…), else regular. -isc- verbs (capire→capisco) are "regular". band: a1 for core daily verbs, a2 for the rest — your judgment.
- Every conjugated form must be correct standard Italian — verify each cell (uscire: esco esci esce usciamo uscite escono; bere: bevo bevi beve beviamo bevete bevono; piacere: piaccio piaci piace piacciamo piacete piacciono; …).
- English knowns per criteria conventions ("I eat", "he/she eats", "you all eat"…). piacere glosses naturally ("I am pleasing / you like me"→ use "I am liked"? NO — use the natural learner frame: piace → "he/she/it is pleasing (you like it)" is clumsy; acceptable: piace "it pleases (I like)" style — pick ONE consistent frame and document it in your report).
- EVERY example (2 + 6 per lemma = 8 × 55 = 440 sentences) unique — within your file AND vs live dataset AND vs sibling staged files. Natural Italian, contains the exact form, agreement correct. Impersonal verbs (costare, servire, mancare, sembrare, piacere) may use natural third-person-centric examples for awkward cells, but every cell still needs its real form and a grammatical example.
- Validate: python3 -c "import json; d=json.load(open('<path>')); print(len(d), all(len(v['present'])==6 for v in d))"

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-verbs-present-1-report.md (irregulars list, piacere frame choice, judgment calls)
Final message ONLY: STATUS + count + concerns.
