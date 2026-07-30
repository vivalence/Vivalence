# Report: Italian noun batch 5 — technology · materials · society/news · objects/tools · measures

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-5.json`

150 entities, JSON array, validated with `python3 -c "import json; print(len(json.load(open('noun-batch-5.json'))))"` → `150`.

## Split counts

| category | count |
|---|---|
| technology | 30 |
| materials | 25 |
| society/news | 30 |
| objects/tools | 35 |
| measures | 30 |

## Domain mapping (judgment calls, as required by brief)

`structural.js` has no dedicated "technology," "materials," "politics," or "quantity" domain, so the closest legal domain was chosen per item, not applied uniformly per split:

- **technology (30)** → `domain.work` (23: computer, schermo, tastiera, mouse, stampante, messaggio, chiamata, rete, sito, file, password, applicazione, dispositivo, batteria, caricabatterie, cavo, presa, cellulare, tasto, segnale, connessione, account, email — office/personal computing and communication devices) + `domain.entertainment` (7: altoparlante, microfono, telecomando, canale, video, satellite, antenna — media-consumption tech). `domain.home` and `domain.city` were considered and rejected per the brief's explicit steer.
- **materials (25)** → `domain.nature` (20: raw/mineral/elemental materials — legno, ferro, vetro, plastica, oro, argento, acciaio, rame, cemento, gomma, mattone, paglia, cera, bronzo, piombo, marmo, cristallo, stagno, argilla, gesso) + `domain.clothing` (5: fabric-specific materials — lana, cotone, seta, lino, velluto), since these are most naturally taught alongside clothing vocabulary.
- **society/news (30)** → `domain.city` for all 30. This is a stretch for nation/world-scale items (guerra, pace, esercito, bandiera, stato, nazione) since no `domain.politics` or `domain.society` exists — `domain.city` (civic/governmental) is the closest available bucket and was preferred over leaving these undomained.
- **objects/tools (35)** → `domain.home` for all 35. Existing `domain.home` entries (checked live) are furniture/room words (letto, divano, armadio, chiave, sapone, specchio, asciugamano, bottone, ecc. — all already taken); this batch fills the complementary sub-theme of hand tools, kitchen/personal-care items, and fasteners. No lemma overlap with the existing furniture set.
- **measures (30)** → `domain.shape` for all 30 ("Shapes, sizes, and physical qualities" — the closest fit for units, quantities, and dimensions; no `domain.quantity` exists).

## Gender split

masculine 87 · feminine 62 · epicene (no gender symbol) 1 (`presidente.noun` — same form for male/female president, consistent with the live convention already used for `cliente`, `insegnante`, `collega`, `genitore`, etc.).

By split: technology 19m/11f · materials 18m/7f · society 14m/15f/1 epicene · objects 22m/13f · measures 14m/16f.

## CEFR split

a1 6 · a2 77 · b1 67 (mostly a2/b1 per brief; a1 reserved for the handful of highest-frequency items: cellulare, video, ombrello, metro, chilo, numero).

## Entity shape

Matches batches 1–3: `traits: ["TRANSLATED", "EXEMPLIFIED"]` only. Symbols = `word` / `word.lemma.<form>` / `word.part-of-speech.noun` / `word.gender.*` (omitted for the one epicene noun) / `word.number.singular` / one `proficiency.cefr.*` / one `domain.*`. No RANKED, no VOCALIZED, no `proficiency.survival` (none of these five domains are day-one transactional).

## Notable lexical choices

- **Invariable loanwords tagged with a fixed gender per usage**, matching the live `bar.noun` precedent (`il bar`, masculine, already in the dataset): `computer`, `mouse`, `file`, `account` (masculine); `password`, `email` (feminine, standard Italian gender for these borrowings, e.g. "la password"). Number symbol stays `word.number.singular` — invariability isn't a separate symbol, only relevant to the plural-only exclusion below.
- **Plural-only nouns avoided** per brief: `occhiali` and `forbici` excluded. The brief's suggested `orologio` and `ombrello` were checked — `orologio` was already staged in batch 4 (integrated into live `noun.js` mid-task, see below), so only `ombrello` was used; the objects/tools list was built from a larger candidate pool and screened programmatically rather than hand-picking one-for-one.
- **Greek `-ma` masculine exception** carried over from batch 3's convention: none needed here after the `programma` swap (see below), but noted for consistency.
- **Same-word loanwords** (`known == learning`, legitimate per corpus-quality-criteria.md): `computer`, `mouse`, `file`, `password` (kept distinct spellings: known="password" learning="password", same string, both languages use it identically), `account`, `email`, `video`, `antenna`, `satellite`.

## Race condition encountered and resolved (documented per notify-adjustments convention)

The task brief's blocking set was built **before** starting; other agents were concurrently staging sibling batches (`noun-batch-4.json`, `adjective-batch-3.json`, `adverb-batch-2.json`, `verbs-present-2.json` all appeared during this session, and `noun-batch-4` was merged into the live `noun.js`, growing it from 450 → 600 mid-task). The brief's own instruction to "re-verify LAST" caught this: a full fresh rescan immediately before finalizing found two real collisions against the newly-merged batch 4 — `coppia.noun` and `programma.noun`. Both were swapped:

- `programma` (technology/entertainment) → `satellite` (masculine, b1, domain.entertainment)
- `coppia` (measures) → `percentuale` (feminine, b1, domain.shape)

A final fresh re-verify after the swap (fresh scan of all 22 live `dataset/literals/words/*.js` + sibling `.harvest/staged/*.json` files present at that moment) found **zero slug collisions and zero example-sentence collisions**.

## Validation run

- JSON parses; 150 entities.
- Internal duplicate slugs: 0. Internal duplicate example sentences: 0.
- Every `learning` word appears verbatim (case-insensitive) inside its own Italian example; every `known` word appears in its English example (programmatically checked).
- Every entity has exactly one gender symbol, except the one documented epicene noun.
- All `learning` values lowercase.
- Final cross-check against all live `english-to-italian/dataset/literals/words/*.js` (22 files, includes the newly-integrated batch 4) and all sibling `.harvest/staged/*.json`/`.js` files present at completion time — 0 slug or example collisions.

## Concerns

- The concurrent staging/merging environment means a sibling batch could theoretically land between this report and actual integration of `noun-batch-5.json` into the live file. Recommend one more collision check at merge time.
- `domain.city` applied to war/peace/army/nation-scale items in the society split is a genuine stretch of that domain's stated scope ("Urban places and buildings") — flagged for review, not hidden.
