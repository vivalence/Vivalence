# signatures — every key a signature carries, who writes it, who reads it

limit: 40000 chars · writer: agent · study 11-12 · READ-only; probes in the session scratchpad,
nothing in the tree ran. Paths are repo-relative; `~/.viva/registry/...` is the registry.

Method: a string-aware scan of every `.open( .branch( .post( .get( .put( .patch( .delete(
.graft(` call whose first argument is an object literal holding `nature`, over `subsystems/`
`systems/` `commons/` `~/.viva/registry` (skipping `bak/` `node_modules` `dataset/` `build/`
`dist/`), then a grep per key for readers, then two `deno run` probes for the encodings.

## (a) class family

```text
Signature                      subsystems/typology/prototypes/signature.js:5
├── Pattern                    prototypes/pattern.js:6        the Vector's edge, default class
├── Signal                     prototypes/signal.js:5         what is dispatched
│   └── Argv                   prototypes/argv.js:4           shell argv
│       └── ReplSignal         prototypes/replsignal.js:4     a repl signal
├── KeySignal                  prototypes/keysignal.js:19     a key press
├── ToolCall                   prototypes/toolcall.js:6       a model's tool name
├── Action                     prototypes/action.js:5         codec only (schematics)
├── Path                       prototypes/path.js:20
│   └── FilePath               prototypes/filepath.js:45
├── Url                        prototypes/url.js:32
└── Span                       prototypes/span.js:23          telemetry, not routing
Vector                         prototypes/vector.js:4         trie of {pattern, trajectory}
├── Twitch                     prototypes/twitch.js:9         effects SEQUENCE, patterns replace
└── Aperture                   prototypes/aperture.js:4       method-keyed leaves
```

`grep -rnE "extends (Signature|Signal|Pattern|Vector|…)"` over `systems/` `commons/` and the
registry returns nothing: every derivative lives in `subsystems/typology/prototypes/`.
No product code calls `withSignature` or passes a second constructor argument to
`new Vector(…)`: every live trie uses `Pattern` (`vector.js:5`).

### Signature — the base (`signature.js`)

- ctor `(signature = null, trace = null)` `:11`. Order: `gauges = []` `:12` → `coerce` `:13`
  → a fn is called with the class and re-coerced `:15` → a same-class instance is RETURNED
  re-parented `:16` → another Signature copies only `nature` `:17` → a string is `nature`
  `:18` → `is.signature` (`object` with defined `nature`, `gestalten/is/scalars.js:107`)
  is `Object.assign`ed WHOLE onto the instance `:19` → an array is `[head, ...heirs]`:
  head becomes the root, heirs `branch` under it, the ROOT is returned `:20-25`.
- `coerce` `:31` walks `static coercions` (`[[test, transform]]`, both `.call(this)`), first hit.
- `from(trace, anon)` `:40` sets `trace`, pushes self into `trace.gauges` unless `anon`.
- own properties: `nature` · `trace` · `gauges` (children) · plus whatever `Object.assign`
  brought (`:19`). Every extra key on a signature rides this assignment.
- getters: `absolute` (natures root→fin) `:48` · `json` `{nature, absolute, trace?}` `:52` ·
  `hash` (memo of `hasher()` = `[nature]`) `:70-76` · `array` (heritage + heirs) `:79` ·
  `heir` (`gauges[0]`) `:120` · `fin` (last heir, `null` on a leaf) `:124` · `root` `:130` ·
  `depth` `:136` · `length` `:145` · `index` (ancestor count) `:150` · `lua` `:202` ·
  `ghost` (no nature, has heir) `:213`.
- generators: `ancestory` `:90` · `heritage` `:97` · `descendants` `:105` · `finn` `:112`.
- methods: `clone` `branch` `stick` `yeet` `barf` `rebase` `pop` `drop` `grab` `luca`.

### Pattern (`pattern.js`)

- `hasher` = `[index, type, nature, trace?.hash]` `:48`.
- `json` = `{pattern: "/a/b", parts, types}` `:7-14`.
- `apply(signal)` `:52`: runs `this.filter(signal, this)`; on a match COPIES `this.input`
  and `this.output` onto the match `:55-56`. A literal's filter returns the incoming
  signal segment itself (`:86`), so the copy lands on the caller's Signal segment.
- per-segment `type` + `filter` from `patternmap` `:64-88`: `*` → `wildcard` (new signal
  `{...signal, type}`) · `(.*)` → `remainder` · `:name` → `parameter` (new signal with
  `parameter`, `parameters: {[name]: nature}`) · anything else → `literal` (equality).

### Signal (`signal.js`)

- `hasher` = `[index, nature]` `:109` · `pathname` `"/" + absolute.join("/")` `:119` ·
  `json` `{nature: pathname, body, flags}` `:123` · `rebase` keeps `body` `flags` `:113`.
- `static flag(key)` refuses a numeric flag (`--3` throws TypeError) `:100`.
- `static tokens(input)` = `words` `:105`: splits on space/tab, `'` and `"` group and are
  STRIPPED `:132-158`.
- `body` and `flags` live on the ROOT segment (`:33`, `:94`; argv `:43`).

### Argv (`argv.js`)

- getter `argv` re-encodes: `[nature, --k | --k=v…, (-- if any operand starts with "-"),
  operands]` `:50-56`; non-string data is `JSON.stringify`d.

### KeySignal · ToolCall · Action · Path · FilePath · Url · Span

- KeySignal: `MODIFIERS ["ctrl","alt","shift","meta"]` `keysignal.js:4`, `NAMES` (escape→esc,
  return/linefeed→enter, arrows→left/right/up/down, " "→space) `:6`, `spell` `:10-17`.
- ToolCall: `hasher [index, nature]` `toolcall.js:19` · `name` = `absolute.join("_")` `:23` ·
  `signal` = `new Signal(absolute.join("/"))` `:27`.
- Action: `apply` is literal equality `action.js:19`, `hasher` = `absolute` `:23`. Only
  reader: the codec `schematics/prototypes/signatures.js:30`.
- Path: `absolute` is a string (concatenated natures, `..` collapsed) `path.js:32`,
  `filename` `dirname` `json` (`parse`) `toPrimitive`. FilePath adds `anchored` `relative`
  `parts` `filepath.js:48-57`.
- Url: `origin` `query` own fields `url.js:35`; `branch` joins paths, keeps origin `:66`;
  `with` `scheme` `protocol` `secure` `search` `searchParams` `absolute` `json` `href`.
- Span: `from(trace)` is ALWAYS anon `span.js:37`; `tracked` is a Vector of track names
  `:33`; each name becomes a method `:47`. Its nature is a span name, never a route.

### Vector · Twitch · Aperture

- Vector own fields: `effect` (null) · `trie` (`Map<nature, {pattern, trajectory}>`) ·
  `carry` (middlewares) · `ancestor` · `signature` (the edge class) `vector.js:5-11`.
- `branch(signature, vector)` `:23`: coerces with `this.signature`; a null nature with no
  heir is a no-op `:26`; the edge is keyed by the FIRST segment's nature `:28`; an
  existing edge KEEPS its pattern — the second declaration's keys are dropped `:28-35`
  (probe: two `branch({nature:"m", valence})` → `"first"`); recurses on `pattern.heir` `:36`;
  returns the deepest child.
- `open(sig, effect)` sets `effect` on the deepest child, overwriting `:42-45`. `do` refuses a
  second effect (logs, returns undefined) `:47-51`. `affect` = `do` `:53`.
- `graft(...vectors)` `:57-71` — see (d).
- getters `patterns` `descendants` `root` `heir` `:73-86`; method `survey(visit)` `:88`.
- Twitch: `open` SEQUENCES a second effect `twitch.js:10-13`; `graft` sequences root effects
  and REPLACES an existing edge's pattern `:23`.
- Aperture: `get post put patch delete` → `_route(method)` `aperture.js:5-24`; the leaf effect
  is a `methods()` dispatcher fn with a `.methods` map `:32-41`; a prior plain effect becomes
  `methods["*"]` `:18`; method `"*"` with exactly one handler picks it, else throws `:43-48`.

## (b) encodings — every input each class accepts

| class | input | rule | site |
|---|---|---|---|
| Signature | `fn` | called with the class, result re-coerced | `signature.js:15` |
| Signature | same class | returned as is, re-parented | `:16` |
| Signature | other Signature | copies `nature` only | `:17` |
| Signature | string | `nature` | `:18` |
| Signature | `{nature,…}` | `Object.assign` whole | `:19` |
| Signature | array | head root, tail heirs | `:20-25` |
| Pattern | `{nature: string,…}`, no fn `filter` | split `/`; extra keys → LAST segment | `pattern.js:17-31` |
| Pattern | string | split `/`, each `{type, nature, filter}` | `pattern.js:33-45` |
| Signal | Signal of another class | `pathname` + `body` + `flags` | `signal.js:7-14` |
| Signal | `{nature:"/…", body: array}` | packet: `nature` + `body` + `flags` | `signal.js:15-20` |
| Signal | `URL` | pathname segments; `searchParams` → flags | `signal.js:21-35` |
| Signal | string | tokens: words = segments, `--k v` `-k v` `-abc` flags | `signal.js:36-97` |
| Argv | string | `Argv.tokens` then the array rule | `argv.js:6-11` |
| Argv | string[] | first non-`--` token = nature; rest positional | `argv.js:12-46` |
| ReplSignal | string not `/`, not `--` | `{nature:"*", body:[{type:"text",text}], flags:{}}` | `replsignal.js:6` |
| ReplSignal | other string | drop leading `/`, tokens, Argv array rule | `replsignal.js:7-12` |
| KeySignal | `{sequence: string}` (opentui) | `ctrl` `meta‖option`→alt `shift` `super`→meta | `keysignal.js:21-24` |
| KeySignal | `{key: string}` (DOM) | `ctrlKey altKey shiftKey metaKey` | `keysignal.js:25-28` |
| KeySignal | string | `[{nature: key}]` | `keysignal.js:29` |
| ToolCall | string | split `_`, each `{nature}` | `toolcall.js:7-17` |
| Action | string · `{nature}` | collapse `//` | `action.js:6-17` |
| Path | null | throws TypeError | `path.js:22` |
| Path | `file://…` · string | `{nature: normalize(...)}` | `path.js:23-24` |
| FilePath | string | `~` expanded, `..` reduced, `/` root segment | `filepath.js:38-46` |
| Url | string url · URL-ish · Signal · string | `{nature, origin, query}` | `url.js:38-60` |

Probe results (scratchpad `probe.js`, `deno run -A --no-check`), verbatim:

```text
# subsystems/typology/prototypes/*.js, observed 11-12
new Signal("/a/b --x 1 -abc -k=v -- -z").json
  {"nature":"/a/b/-z","flags":{"x":"1","a":true,"b":true,"c":true,"k":"v"}}
new Signal({ nature: "a" }).json                     {"nature":"/a"}
new Signal(new URL("http://h/a/b?x=1")).json          {"nature":"/a/b","flags":{"x":"1"}}
new Argv(["instance/up","--logged","x","--n=2","--","-y"]).json
  {"nature":"/instance/up","body":["x","-y"],"flags":{"logged":true,"n":"2"}}
new ReplSignal("hello there").json
  {"nature":"/*","body":[{"type":"text","text":"hello there"}],"flags":{}}
new ReplSignal("/dock closed --x").json   {"nature":"/dock","body":["closed"],"flags":{"x":true}}
new ReplSignal('/set {"a":1}').json       {"nature":"/set","body":["{a:1}"],"flags":{}}
new KeySignal(["leader","m"]).absolute    ["leader","m"]
new KeySignal({ key: "v", ctrlKey: true }).nature     "ctrl-v"
new ToolCall("mode_tool_x").signal.pathname           "/mode/tool/x"
```

Notes the probe proves: a Signal string has NO `body` — words are path segments
(`signal.snapshot.json` pins `"play --gameplay PLAIN cat dog"` → `/play/cat/dog`); tokens after
`--` also become segments (`signal.js:47-50`). In a repl signal the quote-stripping of `words`
turns `{"a":1}` into `{a:1}`, which `datum` keeps as a string (`argv.js:59-66`).

KeySignal spelling (`keysignal.js:13-16`): no ctrl/alt/meta and a printable character → the
character itself (`S`, `?`); otherwise `held-modifiers + named key` joined by `-`
(`ctrl-v`, `shift-tab`, `alt-s`). Pinned by `subsystems/typology/tests/keysignal.test.js:8-13`.
`"leader"` is a plain string KeySignal enqueued by `systems/ghost/subjects/terminal/legend.js:34`
and `commands/leader.js:7`.

## (c) the keys

Declaration counts are object-signature call sites, tests included (the scan above):
`nature` 563 · `valence` 427 · `input` 390 · `chord` 43 · `output` 23 · `yields` 21 · `load` 6 ·
`keyed` 6 · `feeds` 3 · `directed` 2 · spreads `...edge` 2 · `...sniff(attrs)` 1.

Placement law, all keys: an object signature's extra keys land on the LAST segment only
(`pattern.js:20,29`); `{ nature: "leader/d/d", valence }` puts `valence` on `d`. A probe:
`new Pattern({ nature: "/a/:id/*", valence: "x", hidden: true })` → only `*` carries both.

### nature

- meaning: the route segment(s); `/`-split by Pattern, `_`-split by ToolCall.
- type: string (a fn / array / instance by the Signature rules).
- declared: everywhere, e.g. `systems/ghost/subjects/client/commands/quit.js` (`"/quit"`).
- writers: every declaration; `Pattern` splits it `pattern.js:21-28`.
- readers: the trie key `vector.js:28`; `strip` key `shape/strip.js:23`; `object` key
  `shape/object.js:13`; `mcp` tool name `shape/mcp.js:10`; `belt/hallucinate.js:11` nameOf;
  `shape/primer.js:6` joined; `ghost/gestalten/shard/keymap.js:3`; `trie.js:14,27` route.

### valence

- meaning: the human/model-facing description of the edge. Convention `"<prose>. Example: <signal>"`
  (split by `ghost/subjects/shell/commands/help.js:57`). In a KEYMAP it is the repl signal the
  chord fires, or a group label `"display · how do I see it"`.
- type: string in product. An object `{slug, name, prompt}` exists only in the test scenario
  `subsystems/typology/tests/scenarios/cats/index.js:9`, read by the drapes skins.
- declared: `systems/ghost/subjects/terminal/commands/dock.js:18`; group edge
  `systems/ghost/subjects/app/keymap.js:4-9`.
- writers: declarations; `paladin/gestalten/belt/prime.js:4` (frontmatter `description` →
  `valence`); `runtime/gestalten/primer/render.js:9` (schema description);
  `ghost/gestalten/shard/keymap.js:10` (fromRepl: valence := the repl signal);
  `ghost/entities/mode/traits/keymapped.js:7`; `shape/repl.js:16,21` (re-declares from strip).
- readers (pattern): `shape/strip.js:10` (→ `effect.valence` / `meta.valence`);
  `shape/primer.js:12,29` (lazy listing); `shape/mcp.js:11` (`description`);
  `shard/hallucinate.js:14` (tool declaration); `ghost/gestalten/shard/keymap.js:29` (catalog);
  `ghost/entities/mode/traits/keymapped.js:7`; drapes skins via `shape.tree`/`flat`:
  `subsystems/drapes/skins/Tree.svelte:28-31,46-49` `Table.svelte:23-26`
  `Breadcrumb.svelte:60-89` `List.svelte:22-23`.
- readers (downstream of strip/catalog/declaration): `ghost/surfaces/chrome/panels/legend/legend.jsx:12-13`,
  `:58,64` (a valence matching `REPL_LINE /^\/\S/` `:31` is dispatched on click);
  `anima/src/surfaces/chrome/panels/legend/legend.jsx:10-11`; `subsystems/sheets/Legend.jsx:5-6`;
  `anima/.../sidebar/sections.js:68`; `ghost/subjects/shell/commands/help.js:57`;
  `ghost/surfaces/chrome/panels/repl/repl.jsx:85`; `commons/hallucinators/anthropic/provider/translate.js:137`;
  `commons/hallucinators/openrouter/provider/translate.js:143`.
- schema: `Tool.valence` `v.string().optional()` `schematics/primitives/hallucination.js:172`.

### input

- meaning: the payload schema of the edge.
- type: a `v` (typebox, enhanced) schema; `steer.strategy.guarded` needs `.cast` and `.errors`
  (probe: a plain `{type:"object"}` → `TypeError: step.input.cast is not a function`).
- declared: `subsystems/paladin/gestalten/commands/instance/clone.js:51-57`.
- writers: declarations; `shape/repl.js:16` forwards `declared.input`; `shape/repl.js:21`
  REPLACES it with `Call` (`schematics/primitives/harness.js:4`).
- readers: `pattern.js:55` (copied onto the match); `steer/strategy.js:49-54` `guarded` cast +
  validate, throws `ValidationError`; `runtime/subjects/mode/traits/emitter.js:12` cast only;
  `shape/strip.js:6`; `shape/mcp.js:12` `inputSchema`; `shard/hallucinate.js:15` → providers
  `anthropic/provider/translate.js:138` `input_schema`; `ghost/gestalten/shard/keymap.js:29`
  (`options` from the FIRST property's `anyOf` consts `:12-19`, `args` = non-empty `required`
  `:21-27`, and the schema itself); `anima/.../sidebar/sections.js:68` (property names);
  drapes skins `defaults(node.signature?.input)` (`Tree.svelte:15` etc.).
- who validates: only `guarded`, whose callers are `shape/mcp.js:7` and
  `belt/hallucinate.js:92` (model tool calls). `dispatch.execute` (`dispatch.js:9-14`),
  `strategy.request` `:36`, `shape/http.js:18-23` and `shard/batch.js:20` never read it. Shell
  and repl commands read `ctx.signal.body`/`flags` (`paladin/gestalten/commands/instance/delete.js:19,49`)
  or cast by hand (`ghost/gestalten/belt/input.js:3-11`, `commands/dock.js:20`).

### input property `.group` (a key on the SCHEMA, not the signature)

- meaning: `"flags"` marks a property as a `--flag` in help; also groups env vars.
- writer: `v.x().group(name)` `schematics/v.js:59-62`; e.g. `paladin/gestalten/commands/ledger/cleanup.js:9`.
- readers: `ghost/subjects/shell/commands/help.js:32,35`; env: `paladin/gestalten/belt/envfile.js:16`,
  `check.js:74`, `commands/instance/install.js:13`.
- siblings help reads on a property: `type` (`help.js:23`), `description` (`:33,36`), and
  `input.required` (`:18`).

### output

- meaning: the result schema.
- declared: `typology/prototypes/cortex.js:74`; `runtime/subjects/mode/traits/harnessed.js:256`;
  `commons/editors/darkroom/aperture/index.js:27`.
- readers: `pattern.js:56` (copied onto the match); `shape/strip.js:7`; `shape/mcp.js:13`
  `outputSchema`. Output validation is commented out (`steer/strategy.js:65`,
  `emitter.js:16`). Not in `shard/hallucinate.js` declarations.

### yields

- meaning: the leaf STREAMS; the value is the schema of each yielded item.
- declared: `typology/prototypes/cortex.js:49,56,62`; `harnessed.js:233,238,240`;
  `runtime/subjects/runtime/lifecycle/3-integration.js:92`;
  `~/.viva/registry/media/modes/editor/media/aperture/index.js:114,136,200`.
- readers: `shape/strip.js:8`; `shape/connection.js:38` (aim becomes `connection.stream`, POST
  unless a method). Only presence is read; the schema is never applied.

### feeds

- meaning: the leaf CONSUMES a stream (duplex); value = the schema of each fed item.
- declared: `typology/prototypes/cortex.js:56`; `harnessed.js:233`.
- readers: `shape/strip.js:9`; `shape/connection.js:35` (aim becomes `connection.converse`,
  checked BEFORE `yields`). Presence only.

### load

- meaning: primer loading, `"eager"` (default) or `"lazy"` (listed, read on demand via
  `primer_read`).
- declared: `commons/instances/hello-world/harness.js:32`; group edge
  `harnessed.js:51` (`primer.branch({ nature: slug, load: "lazy" })`).
- writers: `paladin/gestalten/belt/prime.js:4` (a frontmatter `description` ⇒ lazy);
  `runtime/gestalten/primer/render.js:9`.
- readers: `shape/primer.js:8` (the LAST step on the path carrying `load` wins — an ancestor's
  `load` is inherited), `:31,33,45`; `shape/strip.js:11`; `anima/.../sidebar/sections.js:46`
  (`meta.load ?? effect.load ?? inherited`).

### chord

- meaning: the key sequence that fires a repl command, `/`-joined KeySignal natures
  (`"leader/d/d"`).
- type: string; `is.string` gate `ghost/gestalten/shard/keymap.js:5`.
- declared: `systems/ghost/subjects/terminal/commands/dock.js:18,27`; registry modes'
  repl commands.
- readers: `ghost/gestalten/shard/keymap.js:5` → `fromRepl` `:7-10` (opens a keymap edge
  `{nature: chord, valence: signal}` whose effect is the repl signal STRING) and catalog
  `:29` (`""` when absent); `shape/repl.js:16` forwards `declared.chord`.
- downstream of the catalog: `ghost/surfaces/chrome/panels/repl/repl.jsx:6,87`;
  `anima/src/surfaces/chrome/panels/repl/repl.jsx:22`; `subsystems/sheets/Catalog.jsx:13`.
- NOT in `edgeMeta` (`shape/strip.js:4-14`). Probe: strip of
  `{nature:"/hello", chord:"leader/h"}` has no `chord`; the repl wire of that strip yields a
  pattern with `chord: undefined`. So a remote mode's chord does not cross
  `/metadata/repl` (`runtime/subjects/mode/traits/repling.js:8` →
  `ghost/entities/mode/traits/repling.js:6`).

### methods (on the EFFECT, not the pattern)

- meaning: an Aperture leaf's HTTP methods.
- writer: `prototypes/aperture.js:14-20,39` (`fn.methods`).
- readers: `shape/strip.js:12` (`Object.keys` → `effect.methods: ["GET","POST"]`);
  `shape/connection.js:28-33` (>1 throws, one is the aim's method).

### type · filter · parameter · parameters (Pattern internals; also on matched steps)

- `type` ∈ `literal wildcard parameter remainder`, written `pattern.js:26,41`; read
  `steer/match.js:22` (wildcard skipped first), `steer/dispatch.js:47` (remainder),
  `shape/object.js:30`, `pattern.js:12` json. A declared `type:` key OVERRIDES it (probe:
  `{nature:"x", type:"custom"}` → `type "custom"`, filter still literal) because the extra
  keys are assigned after (`pattern.js:29`).
- `filter` fn, written `pattern.js:26,41`; read `pattern.js:53`. A signature object with a fn
  `filter` skips Pattern coercion (`pattern.js:18`) and is `Object.assign`ed whole.
- `parameter` `parameters`: on the MATCH (a Signal), written `pattern.js:80`, remainder
  `dispatch.js:48-49` (`"0"`, `"1"`, …); read `gestalten/fromm/index.js:52-57` → `ctx.params`
  (`strategy.js:39,58`, `shape/http.js:21`, `shard/batch.js:37`).
- strip keys starting `:` and `*` / `(.*)`: `shape/connection.js:6-10`.

### body · flags (Signal keys)

- meaning: positional data and `--flags` of a dispatched signal; live on the root segment.
- writers: the Signal/Argv/ReplSignal coercions (b); `shape/repl.js:22` (`Call` input → signal).
- readers: `ctx.signal.flags` `ghost/subjects/shell/lifecycle/index.js:22`,
  `3-integration.js:48,51`, `shell/commands/help.js:79`; `ctx.signal.body`
  `paladin/gestalten/commands/instance/*.js`; `ghost/gestalten/belt/input.js:4-7`
  (positional by property ORDER, flags spread over).
- schema: `Signal` `Call` `schematics/primitives/harness.js:4-13`.

### keyed · directed (test scenario only)

- declared: `subsystems/typology/tests/scenarios/cats/index.js:8,10,22,23`.
- readers: tests only (`tests/gestalten/shape/tree.test.js:20,22`, `flat.test.js:16`,
  `steer/survey.test.js:14,19`). No product reader; not in `edgeMeta`.

### open-ended spreads (any key)

- `harnessed.js:99-100`: a caller-supplied tool `{execute, ...edge}` → `armed.open({nature,
  ...edge})`; `Request.tools` desc `schematics/primitives/harness.js:24`.
- `paladin/gestalten/belt/prime.js:5,17`: a markdown file WITHOUT `description` spreads its
  whole frontmatter onto the pattern.
- `tests/gestalten/hallucinate.test.js:38` `toolVector(name, effect, edge)`.

### the full key → reader map

| key | on | strip | wire repl | wire tool | declarations | catalog | mcp |
|---|---|---|---|---|---|---|---|
| nature | pattern | key | ✓ | ✓ | name | ✓ | name |
| valence | pattern | ✓ | ✓ | ✓ | ✓ | ✓ | description |
| input | pattern | ✓ | ✓ | `Call` | ✓ | ✓ | inputSchema |
| output | pattern | ✓ | – | – | – | – | outputSchema |
| yields | pattern | ✓ | – | – | – | – | – |
| feeds | pattern | ✓ | – | – | – | – | – |
| load | pattern | ✓ | – | – | – | – | – |
| chord | pattern | – | ✓ | – | – | ✓ | – |
| methods | effect | ✓ | – | – | – | – | – |

(`strip` `shape/strip.js:4-14` · `wire repl` `shape/repl.js:15-18` · `wire tool` `:20-23` ·
`declarations` `shard/hallucinate.js:11-16` · `catalog` `ghost/gestalten/shard/keymap.js:29` ·
`mcp` `shape/mcp.js:9-14`.) Each consumer names its keys by hand; none spreads the pattern.

## (d) mechanisms

### matching — `steer/match.js`

```js
// subsystems/typology/gestalten/steer/match.js:18
export function scope(vector, signal) {
  const scope = [];
  for (const { pattern, trajectory } of vector.trie.values()) {
    if (pattern.type === "wildcard") continue;
    const match = pattern.apply(signal);
    if (match) scope.push([match, trajectory, trajectory.effect ?? null]);
  }
  if (scope.length > 0 || !vector.trie.has("*")) return scope;
```

- `scope` returns `[match, trajectory, effect]` triples; `*` only when nothing else matched.
- `feed` `:3-7`: none → `NotFound`; with more signal left → the first match; at the tip → the
  first match WITH an effect, else the first. `greedy` `:9` has no product caller in this scan.

### traversal — `steer/dispatch.js`

- `traverse(vector, signals)` `:16-72` → `[effect, carry, steps, position]`.
  - each level remembers the vector's `*` edge as `missing` `:30`; a miss (`NotFound`, or a
    null-nature segment with no effect) falls back to the LAST remembered `*` `:23-27`.
  - a remainder match does not advance `position`; numbers `parameter` `:47-58`.
  - an effect mid-path with more signal left keeps walking `:62-65`.
  - `carry` accumulates each visited vector's `carry` (`trie.js:5` `descend`).
- `execute(vector, context, signal)` `:9` runs `carry(context, resolve(effect))` on YOUR
  context; `invoke(vector, signal, strategy)` `:74` builds a context by strategy;
  `shotgun` `:81` fires every matching tip; `walk(vector, more)` `:108` asks `more(patterns)`
  per level, max 20 (`Long`), empty → `Short`.

### strategies — `steer/strategy.js`

| strategy | ctx built | reads off steps | site |
|---|---|---|---|
| `fire` | arity: 0 → `()`, 1 → `(ctx)`, else `(ctx.input, ctx)`; a non-fn is returned | – | `:6` |
| `resolve` | sets `ctx.output` from the return unless set | – | `:13` |
| `direct` | caller's | – | `:19` |
| `bare` | `{input, output, steps}` | – | `:24` |
| `echo` | `{input, output, signal, steps, params:{}, state:{}}` | – | `:30` |
| `request` | `Context{request:{body,url,method:"*"}, params, signal, steps}` | `parameters` | `:36` |
| `guarded` | as `request` | `input` cast + errors | `:47` |

`fire` returning a non-fn is how a keymap edge whose effect is a STRING yields the repl signal
(`ghost/subjects/terminal/legend.js:64-65`).

### folds — `steer/trie.js`

- `fold(vector, step, frame)` `:16`: frame `{carry, steps, signal, signature}`; `step.node`
  receives `{...frame, effect, trajectories}`; `signature` is the incoming edge's PATTERN.
- `survey(vector, visit, execute)` `:33` → nodes `{signature, effect, invoke, trajectories, path}`
  (read by `shape/tree.js:5` and `shape/flat.js:7-10` → drapes skins `node.signature.*`).
- `rollup(vector, execute)` `:49` → entries `{pattern, steps, fn}` for every effect; `fn` is
  `execute(carry, effect, steps, route)` — callers pass `() => null` or `(c, e) => e` to read
  only the declaration (`shard/hallucinate.js:12`, `keymap.js:8`, `keymapped.js:4`,
  `primer.js:11`).

### graft — pattern merging

```js
// subsystems/typology/prototypes/vector.js:61
      for (const [nature, edge] of vector.trie) {
        const existing = this.trie.get(nature);
        const branch = existing?.trajectory ?? new this.constructor(this, this.signature);
        branch.graft(edge.trajectory);
        if (existing)
          existing.pattern = new this.signature({ ...existing.pattern, ...edge.pattern });
        else this.trie.set(nature, { pattern: edge.pattern, trajectory: branch });
      }
```

(`:65` is one source statement, broken here for width.)

- a NEW edge shares the source's pattern object (`:66`); trajectories are fresh `:63`.
- a COLLIDING edge gets a merged pattern: all own keys of both, the grafted one wins per key
  (`:65`). Because the spread carries a fn `filter`, Pattern coercion is skipped and the
  object is assigned whole — `trace` and `gauges` are copied too. Probe: graft of
  `{valence:"A", hidden:true}` then `{input:"IN"}` → own keys
  `gauges type nature filter valence hidden trace input`.
- Twitch replaces instead (`twitch.js:23`); probe: the same two grafts keep only `input`.
- the root `effect` is overwritten by the grafted one `:60`; `carry` is appended `:68`.
- `branch(sig, vector)` onto an existing edge grafts the vector but keeps the OLD pattern
  (`vector.js:32-34`).

### strip ⟷ wires

```js
// subsystems/typology/gestalten/shape/strip.js:16
export const strip = (vector = new Vector(), pluck = edgeMeta) =>
  steer.trie.fold(vector, {
    node: (f) => {
      const branches = Object.fromEntries(f.trajectories.map((c) => [c.key, c.node]));
      const node = { branches };
      if (f.signature && f.effect === undefined && Object.keys(pluck(f.signature)).length > 0)
        node.meta = pluck(f.signature);
      if (f.effect !== undefined) node.effect = pluck(f.signature, f.effect);
      return f.signature ? { key: f.signature.nature, node } : node;
    },
  });
```

(`:21` is one source statement, broken here for width.)

- node shape: `{branches, effect?, meta?}`; `effect` = edgeMeta of a leaf's pattern+effect;
  `meta` = edgeMeta of a group edge (no effect) when non-empty; the root has no pattern.
- inverse 1 `shape/repl.js:4-13` `wire(node, leaf)`: rebuilds a Vector; a node without
  `effect` becomes `{nature: key}` (its `meta` is NOT restored); a leaf asks `leaf(path,
  declared)` for `[pattern, effect]`. `repl(send)` re-declares `nature valence chord input`
  and sends `ctx.signal` `:15-18`; `tool(call)` declares `nature valence` + `input: Call` and
  calls with `{nature, body, flags}` `:20-23`. Callers: `ghost/entities/mode/traits/repling.js:6`,
  `runtime/subjects/mode/traits/looping.js:7`.
- inverse 2 `shape/connection.js:1-49` `wire(connection, node)`: an object API; `:param`
  becomes a Proxy; `*`/`(.*)` warn and skip; `aim` picks converse (`feeds`) / stream
  (`yields`) / aim by method.
- `shape/object.js:6` and `proxy` `:17`: callable namespaces over a live Vector, no key read
  but `nature` and `type`.
- `shape/primer.js`: `nodes` reads `valence` `load`; an effect returns string · null · Vector
  (`BODIES` `:16-20`).
- producers of `/metadata/*` strips: `runtime/subjects/mode/traits/repling.js:8`,
  `exposed.js:10`, `emitter.js:71`, `harnessed.js:272` (`{routes, primer, tools}`),
  `runtime/subjects/runtime/lifecycle/2-resolution.js:70`, `runtime/gestalten/shard/host.js:18`,
  `ghost/subjects/client/prototype.js:13`; anima `sections.js:41-42` reads `metadata.harness`.

### ghost keymap and legend

- `keymap.fromRepl(repl)` `ghost/gestalten/shard/keymap.js:7-10` and the mode keymaps graft into
  `Legend.keymap` `ghost/subjects/terminal/legend.js:38-46`; a press queue traverses it
  `:52-59`; a prefix sets `$chord = shape.strip(node)`; panels read `effect.valence` /
  `meta.valence` of `branches`.
- `catalog(repl)` `keymap.js:31-34` → entries `{nature, valence, chord, options, args, input}`;
  set on `terminal.repl.$catalog` (`ghost/subjects/app/commands/repl.js:16`); read by
  `ghost/gestalten/belt/completions.js:24,38` and both repl panels.

## (e) schematics

```js
// subsystems/typology/schematics/primitives/harness.js:4
export const Call = v.object({
  body: v.array(v.unknown()).desc(/* harness.js:5, verbatim in the source */),
  flags: v.record(v.string(), v.unknown()).desc('The --flags, as a Signal carries them. …'),
});
export const Signal = v.object({
  nature: v.string().desc('The effect\'s route. Example: "/mode/console/whoami"'),
  body: v.array(v.unknown()).desc('The words after the nature. Example: ["ciao"]'),
  flags: v.record(v.string(), v.unknown()).desc('The --flags. Example: { "pace": "40ms" }'),
});
```

`Signal` is the input of `POST /repl` (`runtime/subjects/mode/traits/repling.js:9`); `Call`
is the input `shape/repl.js:21` gives every tool wired off a repl strip.

- `schematics/prototypes/signatures.js:22-31`: typebox codecs, wire = string, decode =
  `new Prototype(held)`: `Signature` (`token`, encode rooted) · `Signal` (`token`, pathname) ·
  `Path` · `FilePath` (`text`) · `Url` (RFC pattern) · `Action` · `Pattern` (`text`, rooted).
  Re-exported `schematics/prototypes/index.js:27`. No codec for `Argv` `ReplSignal`
  `KeySignal` `ToolCall`.
- `schematics/primitives/contexts.js`: `input` `:5` · `output` `:6` · `request` `:7` ·
  `response` `:8` · `params` `:9` "Path parameters matched off the signal" · `steps` `:10`
  "The matched trajectory, root first" · `signal` `:11` "The Signal that fired" ·
  `vector` = all seven `:65`; `shell` `:49`, `repl` `:54` hold the Vectors.
- `schematics/primitives/hallucination.js`: `Tool {name, valence?, input?}` `:170-174` (the
  lowered declaration); `Request.tools: v.array(Tool)` `:196`; `Part.ToolUse {type, id, name,
  input}` `:65-70`; `Packet.ToolCall {event:"/tool/call", id, name, input}` `:287-292` (a
  `@beef` note on `name` `:290`); `tools: v.unknown()` "A tools Vector, or an already-lowered
  catalog" `:446`.
- `schematics/v.js:46-80`: enhancer keys a property can carry — `description` (`.desc`) ·
  `$id` · `default` · `group` · `examples`; `.cast` `.errors` `.faults` used by `guarded`.
- no schema describes a signature declaration (`{nature, valence, input, …}`) nor the strip
  node (`grep branches schematics/` → 0 hits).

## (f) snapshots

`**/tests/snapshots/` is gitignored (`.gitignore:30`); on THIS disk the files exist:
`subsystems/typology/tests/snapshots/` (27 files), `systems/runtime/tests/snapshots/` (2),
`commons/instances/hello-world/tests/snapshots/` (6). `specimen/snapshot.js:92` folds any
Vector inside a snapshot through `shape.strip`.

```json
// subsystems/typology/tests/snapshots/vector.snapshot.json (vector.snapshot.test.js:13-14)
{ "branches": {
    "drill": { "branches": {}, "effect": { "input": { "type": "object",
      "required": ["count"], "properties": { "count": { "type": "integer", "minimum": 1 } } } } },
    "coach": { "branches": {}, "effect": {} } } }
```

```json
// subsystems/typology/tests/snapshots/aperture.snapshot.json
{ "branches": {
    "board": { "branches": {}, "effect": { "methods": ["GET", "POST"] } },
    "api": { "branches": { "items": { "branches": {}, "effect": { "methods": ["GET"] } } } } } }
```

```json
// subsystems/typology/tests/snapshots/signal.snapshot.json (signal.snapshot.test.js:12)
{ "nature": "/play/cat/dog", "flags": { "gameplay": "PLAIN" } }
```

A catalog entry, asserted not snapshotted:

```js
// systems/ghost/tests/gestalten/shard/keymap.test.js:13
[{ nature: "/mode", valence: "pick", chord: "leader/m", options: [], args: false },
 { nature: "/quit", valence: "leave", chord: "", options: [], args: false }]
```

A group edge's `meta`:

```js
// subsystems/typology/tests/gestalten/shape/strip.test.js:59-63
vector.branch({ nature: "leader", valence: "the leader" })
  .branch({ nature: "d", valence: "display · how do I see it" });
vector.open({ nature: "leader/d/d", valence: "/dock" }, () => {});
// stripped.leader.meta → { valence: "the leader" }
// stripped.leader.branches.d.branches.d → { effect: { valence: "/dock" }, branches: {} }
```

Other pins: `harness-signal.snapshot.json` · `harness-call.snapshot.json` (the two schemas);
`hallucination-declarations.snapshot.json` (`tools: [{name:"bare"}, {name:"dressed",
valence, input}]`); `hello-world-catalog.snapshot.json` (`{name, valence, …}` lowered tools);
`systems/runtime/tests/snapshots/cortex-contract-strip.snapshot.json` (cortex faculties).
Tests on the keys: `tests/signature.test.js:53-69` · `tests/vector.test.js:64,113-122,274-276`
(graft valence merge) · `tests/gestalten/steer/rollup.test.js:82-93` ·
`tests/gestalten/shape/stripwire.test.js:66-68` · `tests/wire.converse.test.js:14-16` ·
`tests/repl.test.js:10-22` · `tests/primer.test.js` · `systems/runtime/tests/harness.primer.test.js:50`
(`meta: { load: "lazy" }`) · `tests/keysignal.test.js` · `subsystems/sheets/tests/legend.test.js:7-8`.

## (g) codemap notes — where the text and the code disagree

- `codestyle.md` quotes `vector.js:57` with `if (existing) existing.pattern = edge.pattern;`.
  Live `vector.js:65` MERGES (`new this.signature({ ...existing.pattern, ...edge.pattern })`);
  the quoted replace survives only in `twitch.js:23`.
- `codestyle.md` quotes `shape/strip.js:15` without the `meta` statement; live `strip.js:21`
  emits `node.meta` for a group edge.
- `typology.md` "`graft` deep-copies": trajectories are new, but a non-colliding edge SHARES the
  source pattern object (`vector.js:66`).
- `typology.md` "ONE effect per node": `Vector.open` overwrites (`vector.js:43`), `do`
  refuses a second (`:48`), Twitch SEQUENCES (`twitch.js:12`), an Aperture leaf is ONE
  dispatcher holding many methods (`aperture.js:14-20`).
- `typology.md` "`*` catches a miss at ANY depth (`match.js:18`)": `scope` (`match.js:18-31`)
  only consults the current vector's `*`; the any-depth fallback is `dispatch.js:23-30`, which
  keeps the LAST `*` seen on the walked path. `ghost.md` "traverse falls to the nearest `*`"
  matches the code.
- `ghost.md` "`catalog` rows carry `valence`": true (`keymap.js:29`); entries also carry
  `chord options args input`.
- `testing.md` "`tests/snapshots/` gitignored": true (`.gitignore:30`); present on this machine.
- `typology.md` "`signature.js:16`'s ctor RETURNS a same-class arg: subclasses declare no
  fields": matches `signature.js:16`; `Url` and `Span` define constructors (`url.js:33`,
  `span.js:26`), Span guarding the same case itself `:27`.

## (h) gaps — not provable by grep

- the key set is from LITERAL object signatures; open spreads (`harnessed.js:100` `...edge`,
  `prime.js:5` whole frontmatter) can carry any key, unenumerable statically.
- `hidden` · `deactivated` or any visibility marker: zero declarations and zero readers
  today (the one `hidden` hit, `~/.viva/registry/assembly/modes/editor/import/aperture/index.js:148`,
  is inside a string).
- whether any REMOTE mode declares a `chord` (and so loses it over `/metadata/repl`): the loss
  is probed; the declarers were not enumerated per registry mode.
- `valence` as an object: only the cats scenario; whether drapes skins (`subsystems/drapes/skins/*.svelte`)
  are mounted by any product surface was not traced.
- `Vector.survey` (method, `vector.js:88`) and `match.greedy` (`match.js:9`): no product
  caller found in this scan; not proven dead (dynamic access unchecked).
- `systems/anima/build/` bundles were excluded; svelte/jsx readers outside the listed
  panels were found by the `.valence|.meta|chord` grep only.
- `output` is declared but no strategy validates it; whether a client reads `outputSchema`
  off the MCP surface was not traced.
- the literal-match mutation (`pattern.js:55-56` writing `input`/`output` onto the caller's
  Signal segment) was read, not probed for observable effects.
