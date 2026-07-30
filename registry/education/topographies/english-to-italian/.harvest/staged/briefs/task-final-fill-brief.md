# Task: stage Italian final fill — 280 literals (mixed PoS, closes the 5000 target)

STAGED file only. Never touch the live dataset.

## Read first
1. Live conventions per PoS: dataset/literals/words/{noun,adjective,adverb,pronoun,interjection}.js — match each family's live shape exactly
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md
3. Legal symbols: dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js) + .harvest/staged/*.json (verbs-present-4/5 + noun-batch-8 are in flight from siblings — include any that exist at your final re-verify). All under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/. After 8 noun + 4 adjective batches expect EXTREME overlap — substitute freely, document.

## The work
Write .harvest/staged/final-fill.json — 280 entities:
- nouns ~120: hobbies/tools/garden (giardino-check, attrezzo, sega, pala, rastrello, semino NO — seme, pianta-check…), bathroom/hygiene (spazzolino, dentifricio, shampoo, rasoio, pettine-check, asciugacapelli…), office (cartella, graffetta, evidenziatore, calendario, agenda…), emotions-3/abstract-3 fills (pazienza, gentilezza, bellezza, ricchezza, povertà, libertà-check, giustizia, coscienza…)
- adjectives ~80: B1/B2 breadth not yet live (economico/economica, gratuito/gratuita, costoso/costosa, conveniente, disponibile, necessario/necessaria, inutile-check, urgente, evidente, ovvio/ovvia, strano/strana-check, tipico/tipica, comune, raro-check/rara, unico/unica, speciale, normale, generale, principale, particolare…)
- adverbs ~40: remaining -mente + degree (estremamente, incredibilmente, notevolmente, leggermente, fortemente, debolmente, altamente, pienamente, totalmente, parzialmente, ugualmente, diversamente, similmente, apparentemente, effettivamente, realmente, virtualmente, tecnicamente, teoricamente, storicamente…)
- pronouns/misc ~40: relative + indefinite pronouns not live (cui, ciascuno-check pronoun use, ognuno, chiunque, qualunque, altro/altra as pronoun, stesso/stessa, medesimo, tale, taluno NO — keep natural: parecchio pronoun-check, troppo-check…) + any high-value closed-class stragglers your blocking scan reveals
- Every family follows its live conventions (symbols, slug shape, gender/number). Every example unique, natural, form-in-example. Validate + final re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-final-fill-report.md
Final message ONLY: STATUS + count + concerns.
