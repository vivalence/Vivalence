---
name: show-me
description: >-
  Walk beef through a CHANGE SET as a REVIEW — a quest, a `jj diff`, a drill's locks, or a design — curated code stops,
  one per turn as `S<k>/N`; he answers `amen` or a change (a drill-me).
when_to_use: >-
  "/show-me" · "show me <quest|change|design>" · "walk me through it" · "review the quest with me" · "what did
  we change" · "take me through the changes" · before a quest flips DONE · after a tangle lands.
---
<!-- limit: 10800 chars -->
# show-me — a change set, toured

**A review is stops; each stop is code, ruled one per turn.** REJECTED: a dump.

## phase 1 · the tour — MINE, never the reply (a `connoisseur` · `bird` pass before a stop is ONE line there, its rows in the changelog: 11-21 a worksheet above the stop, he re-ran `/show-me`)

1. **read the subject whole** — quest: `* rulings` · `* as code` · `* the law` · `* milestones` · `* changelog`; diff: `jj diff -r <change>`; drill: its `Locked` table.
2. **measure the tree** — each hunk: `python3 .ikiro/methods/landed.py --quest <name>`, else grep its NEW text. Tag
   `LANDED` (tree `file:line`) · `QUEST` (`m102-repl.org:LINE`) · `DRIFTED` (both, tree first) — its OWN stop; his `no` reverts it; ≥2 DRIFTED of one shape = wrong shape: offer from-scratch (16).
3. **cut the stops** — a stop mints only under a RULED shape: a lean I re-asked is ruled BEFORE its stop, a fork never shares a stop's closing ask (11-20 a bare `amen` under two asks took the lean) and blocks only ITS stop: the walk opens on the first stop no fork touches, the fork asked when its stop is next (11-21 a fork before any stop, he re-ran `/show-me`), a hunk moving a method's HOME past the lock's FENCE is asked before its stop (11-20 `client` · `home` · the process table moved unasked, /"keep client on instance. drop home."/), and his list of homes · names IS the ruling, a name absent from it is never minted (REJECTED 11-20 two stops under `interceptor-models`, /"no. we just merge … not its own topography"/). A DESIGN not yet cast: HIS steps of the build, fewer and larger, each BOTH sides (paladin's · the runtime's), never a census of what IS (REJECTED 11-19 nine is-stops /"your patterning here isnt right"/ → five, /"way fucking better"/); it closes on `N things to see before you rule` (what breaks · what is mine · what is unenforced), holding only what today's ground cannot answer: an `unprobed` · `unenforced` row whose rig is already open is RUN before the stop is shown, and each sentence of the explanation has its test step or sits there as `unrun` (11-21 ×2 /"expand testing here."/ · /"probe"/), a `-` row on a key · a route is shown AFTER its readers are grepped (11-19 three breaks met only at the cast; 11-21 three methods cut, grepped only after a probe broke), its label above the fence says DIES, what it CARRIED and where that lives after (11-19 /"no what? … whats in /metadata/tier thats not in /metadata/cortex"/); a `breaks` · `stays green` entry is RUN on the copy or tagged READ (11-19 59 sites shown green, red at the cast); a thing cut from a show is `unplaced`, never promised to a later show unmeasured (11-19 the call's speed moved twice); a minted fence is COPIED from its probe, an unlanded hunk probed on a scratchpad COPY of its file (imports absolute, each replace asserted to hit once); an amen'd stop is CAST into its `** milestone N` THAT turn, unasked: an asserted-replace builder on tree copies prints the diff blocks, `apply-diffs.py --root <copy>` replays them, `cmp` closes it (11-21 seven stops left as evidence until /"cast to quest"/ · /"i eqpepct you to maintain quest in the background"/). Else: one per ruling, ONE concern (11-17), 5–12 (a catalog: ONE map; REJECTED 10-27 cards); mechanical hunks AND tests fold into ONE closing table — tests are mine, never a stop (11-09); a stale test · snapshot is FIXED first (11-12). each screened on `drill-me/red-flags.md`, a hit shown; a hunk I MINT in the walk passes skill `connoisseur` first, LOADED, a fork's fence too (11-20 a Q-fence unpassed, rewritten one stop on): a copied sibling brings its epicycles (11-19 a `catch` · `at` · a belt minting, /"entirely wrong"/; 11-21 an operator proof signed inline in a beat, /"so much wiring … i could puke"/). FLOW order: entity → contract → datamap → remote → UI; boot before dispatch.
4. **the ledger** — a row per stop, verdict `—`, re-printed each reply; `* review` before `* handoff` when a quest is live.

```org
* review — 10-24
| S | stop | rides | verdict | his words |
|---|---|---|---|---|
| 1 | the Repl holds every command | Q1 · Q6′ | amen | /"amen"/ |
```

## phase 2 · the walk — one stop per turn

Reply one: tour + S1.

````
**S3/8 — the boot grafts every command once** · Q3 · Q6′ · LANDED

**explanation**
<one paragraph, plain English>

**diff**
```diff
// systems/ghost/subjects/client/lifecycle/index.js:38
-  clientDie.repl.graft(commands.help, commands.quit);
```

**code**
```js
// systems/ghost/entities/terminal/lifecycle/index.js:40
…after, verbatim…
```

**tests**
```js
// systems/ghost/tests/…:LINE
…the expects, AFTER…
```

**usage**
<the chain, prose ABOVE the fence>
```js
// systems/ghost/…:LINE
…the CALLER whole: its unit…
```

**snapshot**
```json
// probe: <scratchpad path> · JSON.stringify(signal, null, 2)
…one real entity, whole, as printed…
```

S3/8: amen, or what changes?
````

Laws of a stop —
- **six sections, this order — explanation · diff · code · tests · usage · snapshot**; prose in explanation ONLY; **airy**: a fence ≤15 lines. A snapshot: the stop's ENTITIES (signal in ·
  object out · each minted), `JSON.stringify(x, null, 2)` of the WHOLE object, a fence each, probe-printed (unlanded: real route, its rig), never
  typed · trimmed · composite · processed (REJECTED 11-09); a contrast is TWO fences; two forms = ONE example, both ways; a RANGE fn draws off-anchor too.
- **usage is the chain, never a bare call** — the caller's WHOLE unit (beat · command; an effect = its WHOLE `.open(signature, effect)` + its CALL, each fn grepped, 11-17 ×2), who runs it, when, where it lands; prose ABOVE the fence, never a comment inside it.
- **the exemplar — siblings · a chain are STACKED fences, one per hand · step** (11-21 /"use that as an exemplary for show-me. your response. the code snippets"/ · /"coding style of last response was great"/): each opens `// N · <what THIS one does, in plain words> — <path>:<line>`, holds only that hand's rows, and the numbers run root → leaf (a chain) or hand by hand (siblings); a function is never split so its head leaves its call; ONE enum table under the fences names what differs. A probed stop closes on its own `N things to see before you rule` (11-21 /"beautiful!! amen"/).

```js
// 1 · darkroom: always "image" — commons/editors/darkroom/aperture/index.js:11
const part = async (ctx, id) => {
  const file = await ctx.entities.file.findOneOrFail({ id });
  const bytes = await paladin.read.bytes(file.mount);
  return { type: "image", mime: file.mime, data: encodeBase64(bytes) };
};
```

```js
// 2 · ocr: image, else document — commons/services/ocr/tools/index.js:22
    const source = {
      type: file.mime.startsWith("image/") ? "image" : "document",
```

- **verbatim** — a fence copies its source, `…` a cut, a wide row stays ONE row (11-20 one tree row shown as two `+`), an unlanded file's `:<line>` is the COPY's `grep -n`, never the quest's row (11-20 two fences; 11-21 one typed off a neighbour's grep, one row short); `diff` for standing code, plain only when the tree LACKS it, grepped (11-17 /"are they additive?"/); each opens `// <TARGET path>:<line>`, no sketch, no prose (11-17).
- **a fence's `// path` is a file that EXISTS, or a NEW one declared in THAT stop** — its home read off codestyle's subject layout (`subjects/<subject>/apertures/`) and its sibling `ls`ed, its name through skill `name`; a fn living only in a probe is never cited as a tree anchor, and a hunk INSIDE a fn he has not seen whole shows that fn whole first (11-20 `3-integration.js, received` on four fences, /"are we inline here? what. show me more context."/); a drill inside a stop keeps the six sections on its re-show (11-20 /"shit answers format."/).
- **the counter is a contract** — `S<k>/N` every reply, through a compact and a drill inside the walk too (11-19 dropped after a compact); N moves only on a drill. `S<k>` · my labels DIE with the walk; after: act + path (REJECTED 11-11).
- **words are the locked ones** — a killed name only on a `-` row, a tree line's too (rename `+`); live, `…` (11-06).
- **an explanation states only what the code ENFORCES** — a constraint the schema lets break is `mine`, in the closing list (11-21 `names at most one owner`, /"they are not exclusive."/); a hunk carries nothing only its RIG needed (11-21 `of(ctx)` off a sibling, /"heavy lifting here."/).
- **no lean, no fork, no `go?`**; a stop replays EVERY lock it rides, never thinner (11-17 ×3). A hunk BREAKING on the probe is a MISWIRE under its lock: the stop shows the trace + the SMALLEST fix, in the lock's own shape (14; 11-17 /"this feels too large"/).
- **a NEW thing · an unseen import is named before it is coded** — what it IS, its file, who reads it, what it PRINTS, then the fence (11-09); a `+` row beyond the ONE he amen'd says whose it is, above its fence (11-20 three `telemetry` rows, one his, /"i did not agree to more than one telemetry?"/).

## his answer

| he says | I do |
|---|---|
| `amen` `ok` `next` `yes` `go` | row → `amen`; next |
| a change · `no` · `why X` | row → `drilling`; the drill below |
| `skip` · `S<k>` · `stop`/`wait` | row → `skipped`, next · re-show k · zero actions |
| `collect my notes` · `dont react` | marks land in `** notes`, acted on when released |

**a change is a drill** — skill `drill-me`, scoped: Q0 = HIS change; A = the stop as shown; B = his change as code. Locks land in the reply (`* rulings` + `* as code` when a quest is live), numbered after the last Q. Done → row `drilled → Q<n>`, re-show
the SAME stop, `S<k>/N` unchanged; his `amen` closes it. A lock is a ledger row, code waits for `go`; changed TESTS land as
sandbox-probed hunks before the re-show, every fence AFTER.

## phase 3 · finish

Last stop ruled → the ledger's `N stops · A amen · D drilled (Q<n>…) · S skipped`. ENDS: no `go`.
