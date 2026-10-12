<!-- writer: agent (lexicon: beef) · limit: 24000 chars · launch: .claude/rules/codestyle.md (symlink, no paths:) · ≥60% fenced code -->
# codestyle — 生きろ

/"i want truth. whatever makes things simple and corherent for us long term while expressing truth, thats us."/ · /"the lisp connoisseur ejaculates. thats the goal for your code."/

## protocol — each gate IS a hook; the hook body is the rule

- **VCS: READ git/jj freely, NEVER WRITE** — not on "go", not to recover. I propose, beef runs via `!`. Subcommand FIRST (`jj rebase` on "go. fix. cleanup." → 2755 files lost).
```sh
# .ikiro/hooks/vcs-guard.sh:27
while read -r sub rest; do
  case "$sub" in
    log|status|show|diff|blame|shortlog|reflog|describe|grep|version|help) ;;
    ls-files|ls-tree|ls-remote|rev-parse|rev-list|show-ref|cat-file|whatchanged) ;;
    config)   grep -qE '^(get|--get|--get-all|--get-regexp|-l|--list)' <<<"$rest" || deny "git config: only reads (get/--list). Propose the write; beef runs it via !";;
    *)        deny "git $sub: graph/worktree mutation. VCS IS WRITE-PROTECTED — propose the exact command; beef runs it via !";;
  esac
done < <(grep -oE '(^|[;&|(`[:space:]])git[[:space:]]+[[:alnum:]_-]+([[:space:]]+[^[:space:];&|`]+)?' <<<"$normalized" | sed -E 's/^[^g]*git[[:space:]]+//')
# .ikiro/hooks/vcs-guard.sh:46
    log|st|status|show|diff|evolog|obslog|interdiff|root|help|version|cat|files) ;;
    op)     grep -qE '^log' <<<"$rest" || deny "jj op $rest: only 'jj op log' is read-only. Recovery is a graph mod. Propose; beef runs.";;
```
- **code + outward acts: propose → per-item `go`**. `.ikiro/` is mine, no gate. A fork he RULED yes is its go — build it, never list it as waiting (/"why waiting stupid"/). Probe code: /"just write stop asking. its all temporary anywys."/
- **no completion claim without fresh verification. A ZERO IS A CLAIM** — a clean compile is not evidence: mount it, read the served bundle.
- **his edit is the spec** — a line `git diff HEAD` shows REMOVED is his kill: never re-add (10-12 `$telemetry` → /"NO. fuck. ill kill you if you try this again."/). **A guard is not a ruling** — report the block, never restate it as policy.
```sh
# .ikiro/hooks/kill-guard.sh:15
killed=$(git -C "$root" diff HEAD -U0 -- "$path" 2>/dev/null | grep -E '^-[^-]' | sed -E 's/^-//; s/^[[:space:]]+//; s/[[:space:]]+$//' | awk 'length($0) > 12')
[ -n "$killed" ] || exit 0
present=$(sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' "$path")
reborn=$(while IFS= read -r line; do
  grep -qxF -- "$line" <<<"$present" && continue
  grep -qF -- "$line" <<<"$incoming" && printf '%s\n' "$line"
done <<<"$killed")
[ -n "$reborn" ] || exit 0
```
- **evidence is taken on HIS side of the wire** — every command I hand him I ran first. A walk ends clean: tabs closed, threads deleted — /"I WANT TO FUCKING MEET AN EMPTY BUFFER!!!"/
- **a library's limit is a probe** — "mikro cannot X" runs on `:memory:` first.
- **`retard` · `i dont understand X` · a bare `what`** → ≤2 lines into the skill that should have fired; twice broken → a hook. Second correction on one screen = the SHAPE is wrong; re-read his sketch. ⟵ skill `fold`
- **a rule carries its rejections** (`REJECTED: x — why`); every departure from the plan is reported. A diff under ~150 lines is reviewed inline; agents: opus, MEDIUM, named.
- **no comments in product source** — a comment is the rename you didn't make.
```sh
# .ikiro/hooks/comment-guard.sh:27
case "$path" in
  *test*|*/bak/*|*.md|*.org|*.json|*.jsonc) exit 0 ;;
  */commons/*|*/systems/*|*/subsystems/*) ;;
  *) exit 0 ;;
esac
content=$(jq -r '.tool_input.new_string // .tool_input.content // empty' <<<"$input")
hits=$(grep -nE '^[[:space:]]*(//|/\*)|[^:]//|[[:space:]]/\*' <<<"$content" \
       | grep -vE '@beef|TODO|eslint|prettier|@ts-|https?:' || true)
```
- **every `.ikiro` file carries `limit: N chars`**; over cap: consolidate, never evict. Prose never rides a heredoc. Public copy says **fair-source**, never "open-source".
```py
# .ikiro/methods/cap.py:16
LIMIT = re.compile(r"limit: (\d+) chars")
# .ikiro/methods/cap.py:33
CODEMAP_TOTAL = 52000
```
```sh
# .ikiro/hooks/kernel-guard.sh:12
case "$path" in
  */docs/superpowers/plans/*) reason="plans are quests in .ikiro/quests/ (skill quest), never docs/superpowers/plans/"; class=plan-placement ;;
esac
# .ikiro/hooks/kernel-guard.sh:21
  grep -qiE '\bopen[- ]source\b' <<<"$content" || exit 0
  reason="public copy says fair-source, source-available — never open-source (LICENSE.md v2.1)"; class=open-source-copy
```
- **a save under `--watch` IS a deploy** — `lsof -nP -iTCP:2501 -sTCP:LISTEN` first. A guard logs its OWN class, never a path or value.
```sh
# .ikiro/hooks/vcs-guard.sh:8
deny() {
  printf '%s vcs-guard deny %s %s\n' "$(date +%s)" "$session" "$(cut -d: -f1 <<<"$1" | tr ' ' '-')" >> "$HOME/.claude/projects/-Users-finn-vivalence-code-vivalence/hooks.log" 2>/dev/null
  jq -n --arg reason "$1 — If this token is PROSE inside a heredoc or script body, write that file with the Write tool and run it by path." '{
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason }
  }'
  exit 0
}
```
## his language

`go` = write-auth for THE item, never a sibling; on a planning turn = the QUEST edits — a replay or new files on a copy IS execution (REJECTED 10-21 /"no filesystem updates yet … just quest level"/); praise ≠ go; `you do X` = ownership in the QUEST, not go (REJECTED 10-16) · `wait` · `stop` · `sotp` = zero actions · `stop asking` · `dont tell me. do` = session-sticky go · `blast` = map consumers; `blast change X go` = map, then act · `amen` = locked · `cleanup` = MY slop only, never his lines or `bak/` · `i suspect` = sketch, code on go · numerals (`5%` · `14 words`) are sticky contracts · rage-caps = stated twice before · typos ("dental" = deno) = parse, never ask · `give me versions` = STRUCTURALLY different candidates · `YES NO??` = one row each, five words · `what did we call X` = grep HIS turns · `artifact` · `inline` = a `.md` in the tree, NEVER the claude.ai tool · `ikiro mark` = canon now · a new name JOINS a metaphor family (ship · spell · food · animal · machine) · `doors` · `drivers` ✗: an aperture OPENS a route.

## comms

~50% of every answer is code (/"responses should be 50% code from now on"/). Every fence opens with its container-rooted path; every path in prose too — /"WHAT FFFFFIIIILLLEEEE?????? context bro"/. A question names `file:line` and what he would see, never a bare noun or fork label (/"What record? There's a shit ton of records in there."/). Decision = context · code before · code after · the choice in one line. /"speak english to me"/ → paragraphs. Move → tree · rename → table · code → diff. Tables hold enums · numbers · symbols only (/"what is what???"/). A label for a mechanism is its English name ("empty function — accepted, does nothing"), never its code. Every `v.object(…)` ships with a passing JSON snapshot. Voice is data: beef verbatim AND the trigger.

## code — one structure, one law, made visible

Triggers — aim at 1–14, beef catches 15–19: 1 traversal IS dispatch · 2 state = `reduce(events)` · 3 one combinator, cases as data · 4 self-priming · 5 branch on the live value · 6 closure-objects, no `this` · 7 cata/ana pairs · 8 recursion mirrors the data · 9 `steer.*` before a hand loop · 10 total over the REAL domain, loud on failure — /"THERE IS ONE WAY THIS WORKS!!!"/ · 11 `[[predicate, tag]]` discriminator · 12 name the algebra · 13 suspension as a value · 14 minimal delta for MY additions, engagement for HIS redesigns · 15 write at the owner · 16 no second epicycle — offer from-scratch · 17 the mechanism already computes it · 18 the bag is the missing contract (/"contract both sides"/) · 19 the surface is grepped, never remembered. /"functions judged by EFFECT, not internal model"/

**1 · 3 · 8 — one fold; `shape.object`, `shape.strip`, `survey` are `node` cases over it, never three walkers.**
```js
// subsystems/typology/gestalten/steer/trie.js:16
export function fold(
  vector,
  step,
  frame = { carry: middleware.forward, steps: [], signal: new Signal(), signature: null },
) {
  const here = { ...frame, carry: descend(frame.carry, vector) };
  const trajectories = [...vector.trie.values()].map(({ pattern, trajectory }) =>
    fold(trajectory, step, { ...here, signature: pattern, steps: [...here.steps, pattern], signal: here.signal.branch(pattern.nature) }),
  );
  return step.node({ ...here, effect: vector.effect ?? undefined, trajectories });
}
```
```js
// subsystems/typology/gestalten/steer/dispatch.js:9
export const execute = (vector, context, signal = new Signal()) => {
  if (!(signal instanceof Signature)) signal = new Signal(signal);
  const [effect, carry] = traverse(vector, signal);
  if (!effect) throw new NotFound(signal);
  return carry(context, resolve(effect));
};
```
```js
// subsystems/typology/gestalten/shape/strip.js:15
export const strip = (vector = new Vector(), pluck = edgeMeta) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const branches = Object.fromEntries(f.trajectories.map((c) => [c.key, c.node]));
      const node = { branches };
      if (f.effect !== undefined) node.effect = pluck(f.signature, f.effect);
      return f.signature ? { key: f.signature.nature, node } : node;
    },
  });
```

**2 · 7 — every cata names its ana**: `soma.pour` ⟷ `soma.drain` · `shape.strip` ⟷ `shape.connection.wire` · `history` ⟷ `chain`.
```js
// subsystems/typology/gestalten/belt/soma.js:3
export function pour(turn, packet) {
  switch (packet.event) {
    case "/turn/open":
      return { ...packet.turn, parts: [] };
    case "/part/open":
      turn.parts[packet.index] = { ...packet.part };
      break;
// subsystems/typology/gestalten/belt/soma.js:85
export function* drain(turn) {
  yield { event: "/turn/open", turn: { role: turn.role } };
  for (let index = 0; index < turn.parts.length; index++) {
```
```js
// subsystems/typology/gestalten/shape/connection.js:1
export function wire(connection, node) {
  const api = {};
  for (const [segment, child] of Object.entries(node?.branches ?? {})) {
    if (segment.startsWith(":")) { parameter = child; continue; }
    api[segment] = wire(connection.branch(`/${segment}`), child);
  }
  let result = node?.effect ? Object.assign(aim(connection, node.effect), api) : api;
```

**4 — a memoized thunk, never `.init()`; no eval-time `v`/Vector inside typology.** An async setup memoizes its in-flight PROMISE, never a boolean.
```js
// subsystems/typology/schematics/prototypes/yield.js:14
let schema;
export const Yield = () =>
  (schema ??= v.object(
    { condition: Condition, output: v.object({ buffer: v.array(v.buffer()) }, { additionalProperties: true }) },
```
```js
// subsystems/typology/gestalten/belt/fn.js:49
export const inflight = (fn, { retry = true } = {}) => {
  let promise = null;
  return (...args) =>
    (promise ??= Promise.resolve(fn(...args)).catch((error) => {
      if (retry) promise = null;
      throw error;
    }));
};
```

**6 · 11 — closure-objects; a discriminator is a `[[predicate, tag]]` table.**
```js
// subsystems/typology/gestalten/belt/atom.js:25
export function chain(root, ...path) {
  return { subscribe(run) { return bind(root, path, run); } };
}
// systems/ghost/surface/chrome/keys.js:9
const CHORDS = [
  [(event) => event.ctrl, (event) => `ctrl-${named(event)}`],
  [(event) => event.meta, (event) => `meta-${named(event)}`],
  [(event) => PRINTABLE.test(event.sequence), (event) => event.sequence],
  [() => true, named],
];
export const press = (event) => ({ key: CHORDS.find(([test]) => test(event))[1](event) });
// subsystems/typology/prototypes/replsignal.js:6
    [(line) => is.string(line) && !line.startsWith("/") && !line.startsWith("--"), (line) => [{ nature: "*", body: [{ type: "text", text: line }], flags: {} }]],
```

**9 · 10 — `steer.*` before a hand loop; total over the REAL domain, loud on failure.** A trait is a CLAIM: its OWNER'S staggered `NAME(owner)` reads `owner.trait.NAME` straight (`systems/runtime/lighthouse/traits/autologin.js:18`); ANOTHER row's → `v.<entity>.trait(row, NAME)`; never `row.trait?.NAME`, never a helper over it (REJECTED 10-16 `reference(client)`). Only `guarded` validates.
```js
// subsystems/typology/gestalten/belt/hallucinate.js:52
const armory = (tools) =>
  steer.trie.rollup(tools, () => null).map((entry) => nameOf(entry.steps)).join(", ");
// subsystems/typology/gestalten/belt/traits.js:25
export function claim(row, name, vocabulary) {
  const schema = vocabulary[name];
  if (!schema)
    throw new Error(`[traits] no trait ${name} in a vocabulary of ${Object.keys(vocabulary).join(" · ") || "nothing"}`);
// systems/runtime/mode/traits/harnessed.js:28
  ctx.intelligent = v.thread.trait(ctx.thread, "INTELLIGENT");
  ctx.vocal = v.thread.trait(ctx.thread, "VOCAL");
```
```js
// subsystems/typology/gestalten/steer/strategy.js:46
export const guarded = (carry, effect, steps, signal) => async (input) => {
  for (const step of steps) {
    if (step.input) {
      input = step.input.cast(input);
      const errors = [...step.input.errors(input)];
      if (errors.length) throw new ValidationError(errors, signal);
    }
  }
```

**absence IS the signal** — no `?? {}` · `|| x` · `?.` without a grep proving the case; a union carries a tag. **The mechanism IS the guard** — `let released = false` ✗ · `if (host.slug !== "runtime") throw` ✗ (/"very very very very stupid"/) → `fn.once`, a grafted-or-ABSENT route, a pruned trie.
```js
// subsystems/typology/gestalten/belt/fn.js:1
export const once = (fn) => {
  let called = false;
  return function (...args) {
    if (called) return;
    called = true;
    return fn.apply(this, args);
  };
};
// systems/anima/src/entities/buffer.js:64
    mount: (callback) => {
      this.hooks.mount.push(fn.once(callback));
      return this;
    },
// systems/runtime/mode/traits/tooling.js:1
export const TOOLING = (mode) => {
  if (!mode.module.tools) return;
  mode.tools.graft(mode.module.tools);
};
// subsystems/typology/gestalten/shard/datamap.js:189
  if (only) for (const nature of [...aperture.trie.keys()]) if (!only.includes(nature.replace(/^\//, ""))) aperture.trie.delete(nature);
```

**names** — full, by FP role (`fold` · `pour` · `drain`), naming the PAIR; a ctx is `<vector>Die`. `t d p cfg` ✗. `row` ✗ → entity. `verb` ✗ (/"a nothing word"/ 10-21) → a repl effect · a tool · a route. Every `.desc(` ends with `Example: …`. `input`/`output` = a SCHEMA on signatures, the payload on `ctx`
```js
// systems/runtime/gestalten/tools/mode.js:25
    input: v.object({
      type: v.string().optional().desc('A mode type. Example: "office"'),
      slug: v.string().optional().desc('A mode slug. Example: "vdex"'),
    }),
```

**no intermediary** — `clientDie.client.runtime.x` inline, never `const { client } = clientDie`. **A mechanism is SHOWN, never wrapped**: two entries are two functions, never `Object.fromEntries` over a config; a new mechanism is a blunt `testament/prototypes/<name>/run.js` first. Stop-tells: an options bag on a positional; a flag undoing a flag.

**a function's HOME is its first parameter**: `boot(lighthouse)` ✓, `lighthouse.boot()` ✗. **A SUBJECT runs and owns a directory** (m91): `<subject>/prototype.js` (class · `repository` · `hydration`; `<Subject>.ts` when mikro) · `factory.js` (the use-export) · `lifecycle/index.js` (the Vector `execution` last, + PHASE files — /"the lifecycles are not a repotitory of tools!"/) · `traits/<NAME>.js` + `traits/index.js` the catalog the lifecycle imports itself · `commands/` · `apertures/`. Unowned → `entities/` (an entity that does not run) · `prototypes/` (a class without a boot) · `gestalten/` is TOOLING, abstract, blind to client · terminal · mode (REJECTED 10-21 `ghost/gestalten/shard/keymap.js` — /"Gestalten is only for abstract things."/): `shard/` (`(ctx, next)` of two subjects) · `belt/` (plain over data: no fs, no paladin) · `tools/` (named by its OBJECT). `typology.js` exports PREDICATES (`traits.mode.DATASET`), never a subject; use imports the factory, tests the lifecycle. REJECTED 10-17: object-first systems · `executions/`. An execution closes what it opened in its OWN `finally`.
```js
// systems/runtime/runtime/lifecycle/index.js:13
export const execution = new Vector()
// systems/runtime/runtime/lifecycle/resolution.js:11
export const services = (execution) => async (die, next) => {
  try {
    for (const service of await die.runtime.processes.service.find()) await service.execute(execution);
    await next();
  } finally {
    await die.runtime.processes.service.kill({}, "SIGTERM");
  }
};
```

**a vector exports as a VALUE grafted onto its parent, never a factory; the trait function IS the dispatch** — one file per trait; the trait's body lives in its module (/"putting the insitu trait on the TERMINAL?!?!!? weird."/). `mode.module.*` is the DECLARATION: a trait mints its OWN Vector, then grafts it in. `graft` COPIES carry, `use` PUSHES — a re-mounted surface stacks a second tap.
```js
// systems/ghost/client/commands/quit.js:3
export const quit = new Vector().open(
  { nature: "/quit", valence: "leave — the client stops, the shell exits 0. Example: /quit" },
  (ctx) => ctx.client.controller.kill("SIGTERM", "quit"),
);
// systems/ghost/client/lifecycle/index.js:40
  clientDie.repl.graft(commands.help, commands.quit);
```
```js
// subsystems/typology/gestalten/belt/traits.js:6
export async function stagger(module, context, traits) {
  const finalizers = [];
  for (const name of module.manifest.traits) {
    const result = await traits[name]?.(module, context);
    if (is.fn(result)) finalizers.push(result);
// systems/runtime/mode/traits/harnessed.js:182
  const harness = new Vector()
    .use(shard.context.spread(contexts.host, context))
    .use(shard.context.bind("mode", mode))
// systems/runtime/mode/traits/harnessed.js:200
  if (mode.module.harness) harness.graft(mode.module.harness);
// systems/runtime/mode/traits/harnessed.js:225
    mode.harness = shape.object(harness, steer.strategy.echo);
```
```js
// subsystems/typology/prototypes/vector.js:57
  graft(...vectors) {
    for (const vector of vectors) {
      if (vector === this) continue;
      if (vector.effect) this.effect = vector.effect;
      for (const [nature, edge] of vector.trie) {
        const existing = this.trie.get(nature);
        const branch = existing?.trajectory ?? new this.constructor(this, this.signature);
        branch.graft(edge.trajectory);
        if (existing) existing.pattern = edge.pattern;
        else this.trie.set(nature, { pattern: edge.pattern, trajectory: branch });
      }
      this.carry.push(...vector.carry);
    }
```

**entity capability = a REPOSITORY VERB on both sides, mikro-first** (/"we design mikro-orm first! mark that."/): ① repository method → ② typology contract → ③ `shard.datamap.repository` → ④ `RemoteRepository` → ⑤ UI. `thread.call = connection.branch(…)` ✗ /"big no! you have it inside out."/ ≤2 positionals `(where|data, opts?)`. An entity imports mikro + typology ONLY, never paladin; a disk patrol is a lifecycle beat (REJECTED 10-16 /"dumbest anti-pattern"/).
```js
// subsystems/typology/gestalten/shard/datamap.js:170
  aperture.post("/updateOne", scoped("where", (input, ctx) => of(ctx).updateOne(input.where || {}, input.data || {})));
// subsystems/typology/prototypes/remote-repository.js:127
  async updateOne(where = {}, data = {}) {
    const result = await this.connection.call("/updateOne", { where, data });
    return await this.merge(result);
  }
// systems/runtime/entities/Turn.ts:13
  history(where, opts?) {
    return this.find(where, { ...opts, orderBy: { createdAt: "ASC" } });
  }
  async chain(data, opts?) {
    const parent = data.parent ?? (await this.history({ thread: data.thread }, opts)).at(-1) ?? null;
```

**a `$`-store ships a plain getter**; never `mode.$intents?.get() ?? []` — one `computed` per `$field`.
```js
// systems/anima/src/box/device/speaker/speaker.js:8
  $claimed = atom(false);
// systems/anima/src/box/device/speaker/speaker.js:21
  get claimed() { return this.$claimed.get(); }
// subsystems/typology/prototypes/entity-manager.js:196
      if (!entity["$" + field]) {
        entity["$" + field] = computed(childRepo.$entities, (entities) =>
          entities.filter((child) => child[mappedBy] === entity || child[mappedBy]?.id === entity.id || child[mappedBy] === entity.id),
        );
      }
```

**structure** — one child = a rename, not a directory (/"2 bad. thats just a directory around each file."/); a multi-file dir carries an `index.js` barrel; cluster by what co-varies. `manifest` is metadata. **If it's concrete, it's a LITERAL** (/"events are not symbols"/). **Mask keys are SEMANTIC**, lookup surfaces LEXICAL (`daemon.modes.<type>.<slug>`); `mask` → `module` → `mode`.
```js
// subsystems/typology/schematics/primitives/instance.js:12
export const Mask = v.object(
  { module: v.string(), statics: Statics().optional(), secrets: Secrets.optional() },
  { additionalProperties: true },
);
```

**universal over parochial** — `^(https?|wss?)://\S+$` ✗ → RFC 3986 productions, named ✓ (/"build something that is not for our case, but coherencely universally true."/). No hidden rule over an explicit grammar (/"this is iffy as fuck. dont like."/) → the repository's own `$all · $in · $none`. **A provider translates ONE request**; `belt.hallucinate` owns the session.
```js
// subsystems/typology/schematics/scalars/url.js:17
export const PATTERN = `^${SCHEME}://${USERINFO}${HOST}${PORT}${PATH}${QUERY}${FRAGMENT}$`;
export const url = (opts) =>
  v.string({ pattern: PATTERN, title: "RFC 3986 URI with an authority (scheme://…)", ...opts });
// subsystems/typology/gestalten/belt/hallucinate.js:92
        steer.dispatch.invoke(armed, new ToolCall(call.name).signal, steer.strategy.guarded)(call.input),
```

**client is domain-blind** — /"nothing domain or mode specific can be loaded rendered or run on the client"/: domain words arrive as DATA; mode UI only through the APPLICATION bundle. A buffer row IS the screen: selection · cursor · draft → `buffer.data` (/"state should include my current sleecteds!"/). A hex literal in a view is a defect — the dapper token is the answer.
```js
// systems/ghost/surface/chrome/index.js:24
  const erase = paint(renderer.root, renderer, tokens("northsea", "2"), panes.chrome, { client, accept: [mime.tty.solid, mime.json] });
```

**tests** — a repo test never reads THIS MACHINE; census = `HOME=<empty dir>` (/"no test inside /repo depends on this! in repo testing we ought to stub in a temp."/). A merge/copy suite ends with "source is not mutated". NEVER `deno fmt`. A re-resolvable scope is derived at USE, never frozen at import.
```js
// systems/runtime/tests/scenarios/hello.js:88
  const root = await Deno.makeTempDir({ prefix });
// systems/runtime/tests/scenarios/hello.js:125
  const child = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "--no-check", "--config", join(REPOSITORY, "deno.jsonc"), ...(watch ? WATCH : []), RUN],
    cwd: join(root, "instance"),
    env: { ...carried, ...env },
    clearEnv: true,
// subsystems/typology/tests/bundle.test.js:21
  specimen.it("merge() keys by mime, the later entry wins; the sources are not mutated", () => {
    const first = new Bundle({ entries: [svelteEntry] });
    const merged = Bundle.merge(first, { entries: [htmlEntry] }, { entries: [replaced] });
    specimen.expect(merged.entries).toEqual([replaced, htmlEntry]);
    specimen.expect(first.entries).toEqual([svelteEntry]);
// subsystems/paladin/ledger/prototype.js:30
  record(slot) {
    const home = this.paladin.scope.ledger;
    const value = this.authored(source)?.[slot];
    if (value === undefined) return { path: home.branch(`${slot}.json`), fallback: true };
```

## weak flanks

client/CSS · large blasts (decompose) · overproduction. `canary` → `生きろ`.
