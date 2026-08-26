# method: thin — inline docs are a budget, not a canvas

**Constraint.** Code carries no comment unless a reader who has the code in front of them still
cannot get there. One line. Never a paragraph. Never a rationale essay.

The kernel already says it — *"code is self-documenting: no comments, no `_var`, no shims, full
true names, zero ceremony"* — and it still failed, repeatedly, across a whole session. So it is
restated here as a constraint with a check, because a rule in the always-on channel is evidently
not enough to stop the behaviour.

## the failure mode

Reasoning is expensive to produce, so it feels valuable to keep. It is not. The place for *why*
is the quest and the compact; the place for *what* is the name. A comment that narrates a
decision is the decision leaking into the wrong artifact.

beef, on the pattern: *"be THIN on the inline docs!"* · *"trim it to basically nothin. always!"*

## the check — run it before reporting any code change

```sh
git diff -U0 | grep -c '^+\s*//'     # added comment lines
```

Compare against added non-comment lines. **Over ~1 in 12 is a fail** — go back and cut.

## what survives the cut

- A superseded implementation, kept as commented code when asked, with **one line** saying why it died.
- A non-obvious invariant that would be silently violated (`branch() MUTATES, never reuse a Path`).
- A measured fact that reads as a mistake without it (`new Url(unset) does not throw`).

## what never survives

- Restating the identifier below it.
- Narrating the alternative that was rejected.
- Explaining the mechanism the code already shows.
- Anything with "which is why", "the whole point", "so that a caller can".

Related: [[quest]] holds the reasoning · `compacts/` holds the history · this holds neither.
