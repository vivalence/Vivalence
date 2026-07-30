# Report: verbs-present-1.json (55 lemmas)

## Output
`/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/verbs-present-1.json` — 55 lemma objects, 440 example rows (8 per lemma), all unique within file, against sibling `verbs-present-2.json`, against `dataset/literals/` (words/*.js + sentences.js, 495 sentences), and against the other staged batch files (adjective/adverb/noun). Validation: `55 True`.

## Irregulars (present-tense irregular; suffix/regularity as recorded)
- `bere` (ere) → bevo, bevi, beve, beviamo, bevete, bevono
- `uscire` (ire) → esco, esci, esce, usciamo, uscite, escono
- `piacere` (ere) → piaccio, piaci, piace, piacciamo, piacete, piacciono

Everything else is `regular`, including:
- `capire` (-isc- verb: capisco/capisci/capisce/capiamo/capite/capiscono) per brief instruction.
- Orthographic h-insertion verbs (`pagare`, `cercare`, `giocare`, `dimenticare`, `mancare`) — spelling adjustment only, not a conjugation irregularity; matches the precedent set by `toccare` in `verbs-present-2.json`.
- Verbs whose *participle* is irregular but whose *present* is fully regular (`aprire`→aperto, `chiudere`→chiuso, `vedere`→visto, `perdere`→perso, `correre`→corso, `vivere`→vissuto) — regularity is scored on the present tense only, per the brief's rule.

## piacere frame
Adopted a single literal frame across all six present cells and the infinitive/participle: **"[subject] please(s) (parenthetical: who likes whom)"** — e.g. `piaccio` → "I please (you like me)", `piace` → "he/she/it pleases (I like him/her/it)", `piacciono` → "they please (I like them)". This mirrors the brief's own suggested acceptable style ("it pleases (I like)") and stays internally consistent across the full paradigm rather than switching frames per cell. Documented once here rather than re-derived per example.

## Judgment calls on the other "impersonal" verbs
For `costare`, `sembrare`, `mancare`, `servire` I found natural full-paradigm framings that avoid the piacere-style awkwardness entirely, so I used those instead of forcing a dative/impersonal reading onto all six persons:
- `costare` — colloquial-but-real Italian usage where "costare" applies predicatively to people/groups being expensive/high-maintenance ("Tu costi troppo per il mio budget", "Costate una fortuna, ragazzi!"), alongside the standard literal usage for 3sg/3pl (biglietto, scarpe).
- `sembrare` — "sembrare + adjective" agreeing with a personal subject is standard Italian ("Sembro stanco", "Sembrate pronti") — no impersonal framing needed.
- `mancare` — used in its "to be absent" sense (subject = the one who is absent: "Manco da lezione", "Manchi sempre alle riunioni") rather than the dative "mi manca" ("I miss") sense, which only naturally takes non-agentive subjects.
- `servire` — used in its primary transitive "to serve" sense (servire il caffè, servire un tavolo) rather than the impersonal "to be needed" sense, for the same reason.

All four still keep a natural, third-person-centric example for their most common register (a price, a look, an absence, a table) alongside the personified 1st/2nd-person cells, per the brief's allowance.

## Bands
32 lemmas marked `a1` (core daily-function verbs: eat/drink/take/put/see/hear/understand/read/write/open/close/go out/arrive/leave/return/enter/bring/buy/look for/find/watch/listen/call/love/help/work/study/play/live/wait/think/use). 23 marked `a2` (stay/pay/cost/lose/learn/teach/sing/dance/walk/run/swim/travel/visit/live-a-life/remember/forget/hope/seem/please/serve/be-absent/try/change) — judgment based on daily-function core vs. elaborated/abstract vocabulary, consistent with the a1/a2 split already used in `verbs-present-2.json`.

## Tooling note
Built one blocking set (5644 normalized strings) up front from `dataset/literals/words/*.js`, `dataset/literals/sentences.js`, and every `.harvest/staged/*.json` sibling (including `verbs-present-2.json`), then generated + validated all 440 examples against it programmatically. Found and fixed 2 collisions before finalizing: `imparare`'s infinitive example duplicated `suonare`'s infinitive example already in the live dataset (both used "Voglio imparare a suonare la chitarra") — replaced with a fresh sentence; and `sperare`'s infinitive example used the conjugated form "Spero" instead of the infinitive "sperare" — replaced with a sentence containing the true infinitive.
