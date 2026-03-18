# Zettelkasten

> Ideas for improving the .agent/claude.md documentation system. Capture here, evaluate later. Don't get distracted — just write the idea and move on.

## How to Use This

When you're working and notice something that could be better about the docs:
1. Write a brief note here under the appropriate section
2. Include enough context that you (or a future session) can act on it
3. Get back to work
4. Periodically (or when asked), review and implement the good ones

When implementing an idea, move it to the "Implemented" section with a date and brief note.

---

## Structural Ideas

Ideas about how the docs themselves are organized, formatted, or connected.

- [ ] **Cross-reference graph**: Build a "depends on / depended by" section in each doc. Currently "Where Used" is stubs. A systematic pass through imports would make these real.
- [ ] **Code snippet anchors**: Each doc should have 2-3 short code snippets showing the compositional elegance. The root doc mentions this but individual docs are still mostly prose.
- [ ] **Version tracking**: Add a "Last verified against" git hash or date to each doc so future agents know how stale they might be.
- [ ] **Quick-start per doc**: First 5 lines of each subsystem doc should answer "what is this, what files matter, what do I read first" — some are better at this than others.
- [ ] **Dependency arrows in root doc**: The System Map table is good but a textual dependency flow (typology → vector → runtime, paladin → runtime, registry → paladin → runtime) would orient faster.
- [ ] **Relative link gotcha**: All docs live inside `.agent/` directories. Links between docs must account for this — paths that look repo-root-relative will resolve wrong. The System Map links in the root doc work because agents interpret them as repo-root paths when using Read, but they're technically broken as relative markdown links. Consider whether to fix them or document the convention.

## Content Ideas

Ideas about what's missing or could be deeper.

- [ ] **Trait lifecycle documentation**: Document exactly when each trait fires, in what order, with what context. Currently scattered across runtime + modes docs.
- [ ] **Entity relationship diagram**: Even textual — which entities relate to which, via what cardinality. Currently spread across typology + learning domain docs.
- [ ] **Circuitry format specification**: A complete reference for what a .viva.js circuit file can contain. Currently implied but never spelled out.
- [ ] **Error handling patterns**: How do errors flow through the system? BaseError → ConnectionError → Response.isError → aperture middleware. Not documented anywhere.
- [ ] **The nanostores pattern**: Client uses nanostores atoms everywhere. Document the reactive state pattern once, reference it from client + Connection + Status docs.

## Process Ideas

Ideas about the self-improvement protocol itself.

- [ ] **Post-session checklist**: After every session, run through: (1) did I update any doc? (2) did I find any inaccuracy? (3) did I discover a cross-reference? Make this a habit, not an aspiration.
- [ ] **Staleness detector**: When reading a doc, check 3 random file paths mentioned. If any are wrong, flag the doc for a refresh pass.
- [ ] **Work Packages sync**: Before starting a task, read the relevant Work Packages. After finishing, update them. Make this part of the Session Protocol in the root doc.

## Testing Ideas

Ideas specifically about testing documentation and gaps.

- [ ] **Test map**: A single document mapping every test file to what it covers and what pattern it uses. Currently spread across all docs.
- [ ] **Specimen evolution tracking**: As specimen evolves toward lifecycle-driven BDD, document the vision and track progress.
- [ ] **Integration test wishlist**: Priority-ordered list of integration tests that would catch the most bugs. Currently just scattered "missing" notes.

---

## Implemented

(Move ideas here when done, with date and brief note)

