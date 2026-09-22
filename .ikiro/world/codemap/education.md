---
paths: ["**/registry/education/**"]
---
<!-- writer: agent · kind: persistent · limit: 8000 chars · folded from auto-memory 09-23 (m69 2.4); the territory is a registry package outside the repo root — the paths glob is unproven for auto-load, read deliberately -->
# codemap: education — the language package (topographies · modes games/home/tactics/teacher · domain)

- kernels need `statics.language` shaped (`instances/italian/daemon.js:14`):
```json
{ "known": { "slug": "english", "name": "English" }, "learning": { "slug": "italian", "name": "Italian" } }
```
- literal ranks number per ONTOLOGY — an unconstrained `feed` interleaves words, sentences and conjugations; constrain by ontology first. (`domain/entities/kernel/Literal.ts:90` · `project_game_ontology_guard`)
- design debt, deferred by beef: grammar facets (tense, person) sit under `word.*` — /"scoping tense and person into word.* is wrong semantically"/ (~694 conjugation entries).
- exercise persons are a topology property: resolve `word.person.*` via `trait.LABELED.name` daemon-side, never a hardcoded `"eu"` (`modes/games/exhibit/buffer/Exhibit.svelte:24`, known-issues).

<!-- generated: python3 .ikiro/methods/codemap.py education — never hand-edited -->
```jsonc
// ~/.viva/registry/education
{
 "manifest": "education.viva.js",
 "vcs": "git",
 "modes": ["modes/bak/dewey.bak", "modes/games/bak", "modes/games/cloze", "modes/games/dojo", "modes/games/exhibit", "modes/games/judge", "modes/games/match", "modes/games/nyan", "modes/games/riddler", "modes/home/aprende", "modes/tactics/clinic", "modes/tactics/harvest", "modes/tactics/impara", "modes/tactics/survival", "modes/teacher/francesca"],
 "domain": ["domain/aperture/bak.classify.js", "domain/aperture/bak.pick/bak.symbol/byStatus.js", "domain/aperture/bak.pick/bak.symbol/byStrength.js", "domain/aperture/bak.pick/bak.symbol/due.js", "domain/aperture/bak.pick/bak.symbol/feed.js", "domain/aperture/bak.pick/bak.symbol/index.js", "domain/aperture/bak.pick/bak.symbol/novel.js", "domain/aperture/bak.pick/index.js", "domain/aperture/bak.pick/lib/byStatus.js", "domain/aperture/bak.pick/lib/byStrength.js", "domain/aperture/bak.pick/lib/filter.js", "domain/aperture/bak.pick/lib/get.js", "domain/aperture/bak.pick/lib/shared.js", "domain/aperture/bak.pick/lib/sort.js", "domain/aperture/bak.pick/literal/byStatus.js", "domain/aperture/bak.pick/literal/byStrength.js", "domain/aperture/bak.pick/literal/due.js", "domain/aperture/bak.pick/literal/feed.js", "domain/aperture/bak.pick/literal/index.js", "domain/aperture/bak.pick/literal/novel.js", "domain/aperture/bak.review/bak/buffer.js", "domain/aperture/bak.review/bak/play.bak.js", "domain/aperture/bak.review/bak/product.js", "domain/aperture/bak.review/bak/scope.bak.js", "domain/aperture/bak.review/bak/symbol.js", "domain/aperture/bak.review/index.js", "domain/aperture/bak.review/literal.js", "domain/aperture/bak.review/memory.js", "domain/aperture/index.js", "domain/domain.viva.js", "domain/entities/bak/Play.bak.js", "domain/entities/index.js", "domain/retention/bak/bayesian/index.js", "domain/retention/bak/boolean/index.js", "domain/retention/bak/schema.js", "domain/retention/bayesian.js", "domain/retention/boolean.js", "domain/retention/counter.js", "domain/retention/index.js", "domain/schematics.js", "domain/tests/aperture/aperture.test.js", "domain/tests/domain.test.js", "domain/tests/kernel/literal.test.js", "domain/tests/retention/bayesian.test.js", "domain/tests/retention/drivers.test.js", "domain/tests/scenarios/domain.js", "domain/tests/tools/tools.test.js", "domain/tests/userspace/scoping.test.js", "domain/tools/harness.bak/educate.js", "domain/tools/harness.bak/index.js", "domain/tools/index.js", "domain/tools/line.js", "domain/tools/lookup.js", "domain/tools/progress.js", "domain/tools/queue.js", "domain/tools/review.js"],
 "folders": {"domain": 7, "instances": 3, "modes": 5, "topographies": 4, "topologies": 3},
 "tests": {
  "domain/tests": 1,
  "domain/tests/aperture": 1,
  "domain/tests/kernel": 1,
  "domain/tests/retention": 2,
  "domain/tests/tools": 1,
  "domain/tests/userspace": 1,
  "modes/games/dojo/tests": 4,
  "modes/games/nyan/buffer": 1,
  "modes/tactics/harvest/tests": 1
 }
}
```
<!-- /generated -->
