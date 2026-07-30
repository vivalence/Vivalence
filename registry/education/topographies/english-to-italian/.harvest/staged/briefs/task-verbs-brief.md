# Task: complete the Italian deep-verb spine (7 remaining lemmas)

## Where this fits
The `english-to-italian` topography (a language-learning dataset) has 9 of 16 deep verbs done via a generator script. You finish the remaining 7: **dare, dire, venire, potere, volere, dovere, sapere**.

## Requirements — read these files FIRST
1. `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/build-verbs.py` — the generator. Existing `VERBS` entries (essere, avere, parlare, credere, dormire, finire, andare, fare, stare) are your exact shape exemplars.
2. `/Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md` — sections "TRANSLATED Trait" (verb known conventions table) and "EXEMPLIFIED Trait". These conventions BIND.

## The work
Append 7 entries to the `VERBS` list in `build-verbs.py`, priorities 10–16, in the order dare, dire, venire, potere, volere, dovere, sapere. Each entry:
- `suffix`: "are" for dare; "ire" for dire (from dicere, conventionally -ire class? NO — dire is classified irregular of the -ere/-ire family; use "ire" for venire, "ere" for potere/volere/dovere/sapere/dire, "are" for dare)
- `regularity`: "irregular" for all 7
- 3 nonfinites (infinitive/gerund/participle: e.g. dire → dicendo, detto), 5 tense tables of 6 cells each (present.indicative, imperfect.indicative, future.indicative, conditional, present.subjunctive), 1 tu-imperative (dai/di'/vieni/sappi — for potere/volere/dovere use the rare-but-standard forms or SKIP the imperative if pedagogically wrong: modals have no natural tu-imperative — for potere, volere, dovere OMIT the "imperative" key ONLY IF the generator tolerates it; check the generator code first — if it requires the key, add tolerance for a missing "imperative" key (skip generation for it) as part of this task).
- Every Italian conjugated form MUST be correct standard Italian. Verify each table cell mentally before writing; these are hand-composed, never pattern-guessed (venire → vengo/vieni/viene/veniamo/venite/vengono; sapere → so/sai/sa/sappiamo/sapete/sanno; dire imperfect → dicevo…; etc.)
- English `known` glosses follow the criteria conventions table exactly (e.g. 1sg present "I give", imperfect "I used to give", conditional "I would give", subjunctive "(that) I give"). Modals read naturally: potere → "I can", conditional "I could"; volere → "I want"; dovere → "I must", conditional "I should".
- Every example sentence is unique across the WHOLE corpus (grep the dataset for your sentence before using it), natural A1/A2 Italian, and contains the exact conjugated form.

## After editing
Run, in this order, and paste real output in your report:
1. `python3 /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/build-verbs.py`
2. `python3 /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/rank.py /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/verb.js`
3. `cd /Users/finn/vivalence/code/vivalence && deno eval 'import d from "./registry/education/topographies/english-to-italian/dataset/index.js"; const ls = d.entities.literal; const slugs = new Set(ls.map(l => l.slug)); const ex = ls.map(l => l.trait.EXEMPLIFIED?.learning).filter(Boolean); const bs = ls.filter(l => l.trait.CONJUGATED); const orphan = bs.flatMap(b => [b.trait.CONJUGATED.infinitive, ...Object.values(b.trait.CONJUGATED.paradigm)]).filter(r => !slugs.has(r)); console.log("literals:", ls.length, "slug-dupes:", ls.length - slugs.size, "example-dupes:", ex.length - new Set(ex).size, "bundles:", bs.length, "unresolved:", orphan.length)'`
All three must be clean (0 dupes, 0 unresolved).

## Hard laws
- NEVER run any git or jj command. Not even read-only. No commits. Ever.
- Touch ONLY `build-verbs.py` (+ files its run regenerates). Nothing else in the repo.
- No code comments anywhere.
- No PII in any file.

## Report
Write your full report to `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-verbs-report.md`: what you added, the three command outputs verbatim, any forms you were unsure of, concerns.
Your final message: STATUS (DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED) + one-line counts + concerns list.
