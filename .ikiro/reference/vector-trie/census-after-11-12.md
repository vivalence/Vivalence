<!-- writer: agent · limit: 2000 chars · the AFTER count of quests/done/vector-trie.org milestones 2 · 3, on the sandbox -->
# collision census — 11-12, after the Map and the seat (sandbox)

Same four suites, same instrument (=census.preload.js= reads both shapes; the repo still gives 2267):

| class                      | before | after |
|----------------------------+--------+-------|
| total                      |   2267 |  2282 |
| same pattern on both sides |     52 |     0 |
| =branch= bare → rich       |      0 |     1 |

Every one of the 15 new hits comes from a test step: 12 in =vector.test.js= (5 new steps · the migrated merge step), 3 from =repl.test.js= (=tools.branch("mode/console")=). No product class moved. =52 → 0= is Q4.

