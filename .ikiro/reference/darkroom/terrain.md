<!-- limit: 30000 chars · measured 2026-11-08 on the tree as it stands · reference, read-only · quest: .ikiro/quests/m118-darkroom.org -->
# terrain — what the machine already has for an image mode, measured

Every claim is a grep on 11-08. Paths repo-rooted; registry paths `~/.viva/registry`-rooted.

## 1. the cortex has NO image faculty

Six faculty types, four avenues on the cortex, five on the daemon wire. `image` is in the CHANNEL vocabulary (a part a dialogue model reads), not the FACULTY vocabulary.

```js
// subsystems/typology/schematics/primitives/hallucination.js:3
export const Channel = v.union([ v.const("text"), v.const("image"), v.const("audio"), v.const("video"), v.const("document"), v.const("object"), v.const("tool_use"), v.const("tool_result"), v.const("thinking") ]);
// :15
export const FacultyType = v.union([ v.const("dialogue"), v.const("object"), v.const("speech"), v.const("verbatim"), v.const("call"), v.const("choice") ]);
```
```js
// subsystems/typology/prototypes/cortex.js:46 — the avenues a Cortex compiles
    for (const avenue of ["dialogue", "object"]) { … .open("stream", …).open("render", …) }
    this.#hallucinator.branch("/verbatim").use(hallucinate.sourcing()).open({ nature: "stream", feeds: Audio.Packet, yields: Verbatim.Any }, …).open("render", …);
    this.#hallucinator.branch("/speech").use(hallucinate.sourcing()).open({ nature: "stream", yields: Audio.Any }, hallucinate.synthesizing(this)).open("render", hallucinate.vocalizing(this));
    this.#hallucinator.branch("/choice").use(hallucinate.tagging()).use(hallucinate.bounding(this)).open("render", hallucinate.choosing(this));
```
```js
// systems/runtime/gestalten/shard/host.js:50 — the daemon wire; "vocal" here, "speech" on the cortex (a drift)
  for (const type of ["dialogue", "object", "choice", "verbatim", "vocal"]) {
    root.branch(type).open("/render", faculty(context.cortex, type, "render")).open("/stream", faculty(context.cortex, type, "stream"));
```

The SPEECH avenue is the template for a non-dialogue faculty: `sourcing` lifts `{source, settings}`, `vocalizing` calls `faculty.via.render(source, settings)` under the controller, bytes come back.

```js
// subsystems/typology/gestalten/shard/hallucinate.js:47
export const sourcing = () => async (ctx, next) => {
  const request = ctx.input ?? {};
  ctx.input = { source: request.source, settings: request.settings ?? {} };
  await next();
};
// :70
export const vocalizing = (cortex) => async (ctx) => {
  ctx.output = await hallucinate.vocalize(faculty(cortex, "speech", "render", ctx.policy.tune), ctx.input, policyOf(ctx));
};
// subsystems/typology/gestalten/belt/hallucinate.js:239
export async function vocalize(faculty, { source, settings }, policy) {
  const span = policy.controller.stdout;
  policy.controller.start();
  span.log({ faculty: faculty.type });
  try {
    return await faculty.via.render(source, settings);
  } catch (fault) { policy.controller.fault(fault); throw fault; } finally { policy.controller.stop(); }
}
```
```js
// subsystems/typology/schematics/primitives/hallucination.js:378
Hallucination.speech = v.object({
  ...controlled(Policy.speech),
  source: v.unknown().desc('Text, or an async iterable of text. Example: "buongiorno"'),
  settings: Settings.optional().desc('Provider knobs, opaque. Example: { voice: "aria" }'),
});
```

A faculty is `{type, tune[4], context?, channels?, via:{render?,stream?}}`; the register guard checks type · tune · via only. `tune` for a non-dialogue faculty is /"an opaque positioning key that just distinguishes variants by proximity"/ (`hallucination.js:150`).

## 2. a provider = a hallucinator module, wired by the ledger

```js
// commons/hallucinators/elevenlabs/service.viva.js
export const manifest = { type: "hallucinator", slug: "elevenlabs", traits: ["MONK"] };
// commons/hallucinators/elevenlabs/provider/index.js:1 — provider(service) → Faculty[]; secrets off service.secrets
export default async function provider(service) {
  const apiKey = service.secrets.key;
  …
    return { type: "speech", tune: voice.tune, context: 0, channels: { in: [{ type: "text" }], out: [{ type: "audio", codec: "pcm_16000" }] }, config: { voice: voice.id }, via: { stream, render } };
```
```jsonc
// ~/.viva/ledger.viva.json — the live ledger; a faculty's secret is a ${SECRET_*} env var
  "hallucinators": [
    { "module": "@commons/hallucinator/anthropic", "secrets": { "key": "${SECRET_VIVA_ANTHROPIC_API_KEY}" } },
    { "module": "@commons/hallucinator/openrouter", "secrets": { "key": "${SECRET_VIVA_OPENROUTER_API_KEY}" } }
  ],
```
```js
// systems/runtime/subjects/daemon/lifecycle/1-population.js:41 — every daemon splits the runtime cortex and adds the ledger's faculties
export const acid = async (die, next) => {
  const faculties = [];
  for (const [index, citizen] of die.register.hallucinators.entries()) {
    try {
      const supplied = await citizen.provider(citizen);
      faculties.push(...supplied.map((faculty) => ({ ...faculty, provider: citizen.manifest.slug })));
    } catch (error) { console.warn(`[provider] ${at} ${citizen.manifest.slug} refused — ${error.message}`); }
  }
  die.daemon.cortex = die.runtime.cortex.split(faculties);
```

`services` are a different thing: `commons/services/nlp` is `type: "service"` with `control` (docker up/down) and `tools`; a daemon `consume`s one and its tools arm under `/service/<slug>` (`harnessed.js:81`). An image API is a hallucinator, not a service — no process to control.

## 3. the model can READ an image, a tool cannot SHOW one

Anthropic translate carries `Part.Image {data, media}` on any turn. A tool result is flattened to TEXT by `speak` — message + the entity rows' spoken fields. There is no path for a tool to put pixels in front of the model.

```js
// commons/hallucinators/anthropic/provider/translate.js:50
    case "image":
      return { type: "image", source: { type: "base64", media_type: part.media, data: part.data } };
// :67
    case "tool_result":
      return { type: "tool_result", tool_use_id: part.id, content: belt.hallucinate.speak(part.output), ...(part.condition === "ERROR" && { is_error: true }) };
```
```js
// subsystems/typology/schematics/primitives/hallucination.js:67 — the yield bag: message · object · one key per entity type
Part.ToolResult = v.object({ type: v.const("tool_result"), id: v.string(), condition: v.string().optional(), output: v.record(v.string(), v.unknown()) });
// subsystems/typology/gestalten/belt/hallucinate.js:37
export const speak = (output) => {
  const { message, ...rest } = output;
  const rows = Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, Array.isArray(value) ? value.map((row) => card(row, spoken(key))) : value]));
  return [message, Object.keys(rows).length ? JSON.stringify(rows) : null].filter(…).join("\n");
```

The Anthropic wire accepts `tool_result.content` as an ARRAY of text and image blocks; the gap is ours, one case in translate and one optional key on the schema. Cost law (`reference/harnesses/harness.md` §0.3): nothing in `turns` is cached, an image in a tool result re-bills every later turn of the thread.

## 4. files on disk — the File row IS the asset (m113)

```ts
// subsystems/typology/entities/File.ts — path · mount · mime · hash · integrity · bytes · traits · trait; mode m:1 · view m:1? · buffers m:n
export class FileRepository extends DataRepository {
  unique(query) { return { mode: query.mode, path: query.path }; }
  async record({ bytes, ...data }) {
    const hash = await crypto.digestBytes(bytes);
    const file = await this.ensure({ ...data, hash, integrity: `sha256-${hash}`, bytes: bytes.length });
    await this.em.flush();
    return file;
  }
  async rewrite(file, bytes) { … }
  async sweep(now) { … MISSING claimed and withdrawn by the patrol … }
```
```js
// subsystems/typology/schematics/entities/file.js:24 — the one trait on File today
  traits: v.object({ MISSING: MISSING.default({}).optional() }),
  spoken: ["id", "path", "mime", "mode", "view", "bytes"],
```
```js
// systems/runtime/subjects/mode/traits/filesink.js — FILESINK: the write pair, store + record, under the mode's mountpoint
    async (ctx) => {
      const mount = join(new Path(mode.mountpoint).absolute, ctx.input.path);
      await paladin.state.store(mount, ctx.input.bytes);
      return context.entities.file.record({ mode: mode.entity.id, path: ctx.input.path, mount, mime: ctx.input.mime ?? mime.of(ctx.input.path), bytes: ctx.input.bytes });
// systems/runtime/subjects/runtime/lifecycle/2-resolution.js:55 — the read: bytes under the file's mime, no token
  attached.branch("/file/:id").use(shard.datamap.errors()).do(async (input, ctx) => {
    const file = await die.runtime.entities.file.findOneOrFail({ id: ctx.params.id });
    …
    return await paladin.read.bytes(file.mount);
// systems/ghost/entities/file/hydration.js:3 — the client row carries its url
  ctx.entity.url = ctx.runtime.attach.url.branch(`/file/${ctx.entity.id}`).absolute;
```

Every mode has a mountpoint seated by paladin: `${host.mountpoint}/mode_<type>_<slug>` (skill `mode`). The media editor settles uploads content-addressed and streams a browser body into the mountpoint:

```js
// ~/.viva/registry/media/modes/editor/media/ingest.js:16
export const settled = (hash, name) => `media/${hash}${extension(name)}`;
// aperture/index.js:114 — a drop lands as the request body, x-viva-name names it
  .open({ nature: "/media/ingest", yields: Progress }, async function* (input, ctx) {
    const body = ctx.request.raw?.body;
    const header = ctx.request.headers.get("x-viva-name");
```

`mime.EXTENSIONS` knows png · jpg · webp · svg (`schematics/scalars/mime.js:34`). No image resizing anywhere in the tree (grep `resize|sharp|imagescript`: 0).

## 5. the buffer and its views

```js
// subsystems/typology/schematics/entities/buffer.js:5 — own: index · mime · data · traits · trait; relations: mode · thread · turns · files · views · literals · symbols
// systems/anima/src/surfaces/chrome/widgets/buffer/renderers.js:10 — a buffer whose mime is image/* is painted as ONE image, files[0]
  [(buffer) => buffer.mime.startsWith("image/"), Image],
// painters.jsx:83
export const Image = (props) => <parts.Image src={href(props.buffer.files[0], props.terminal.client.runtime.attach)} alt={named(props.buffer)} />;
```

A mode's own view: `views = [{ slug, mount: "buffer/X.svelte", mime: mime.dom.svelte }]`, mounted with `{ terminal, buffer, surface }`, state through `buffer.$data`, routes through `buffer.mode.call.<branch>.<route>` (chess `Play.svelte:15,36`). Law: selection · cursor · draft live in `buffer.data` (/"state should include my current sleecteds!"/). A gesture dispatches a repl signal (`frame.jsx:41` `terminal.repl.dispatch`).

## 6. tools · harness · primer — the hello-world shape

```js
// commons/instances/hello-world/mode.viva.js
export const manifest = { type: "demo", slug: "hello-world", traits: ["HARNESSED", "CONVERSATIONAL", "TOOLING", "PRIMER", "EMITTER", "VIEWABLE", "GENERATIVE", "EXPOSED"] };
export const tools = new Vector().graft(doctor).graft(web).graft(research).graft(gestalten.tools.entity.entity, gestalten.tools.buffer.buffer, gestalten.tools.thread.thread, gestalten.tools.mode.mode);
export const views = [{ slug: "hello-world", mount: "app/App.svelte", mime: mime.dom.svelte }];
export const aperture = new Vector().open("/hello/bot", …).graft(…);
export const harness = new Vector().graft(voice);
export { primer } from "./harness.js";
```
```js
// systems/runtime/subjects/mode/traits/harnessed.js:76 — what a tool's ctx carries: host words flat + mode · primer · user · thread
const arming = async (ctx, primer) => {
  const armed = new Vector().graft(paladin.tools.fs.fs).graft(paladin.tools.shell.shell);
  …
  if (ctx.mode.tools) armed.graft(ctx.mode.tools);
  armed.use(shard.context.spread(contexts.host, ctx));
  armed.use(shard.context.bind("mode", ctx.mode));
  armed.use(shard.context.bind("thread", ctx.input.thread));
// :232 — the mode's harness vector is grafted AFTER chaining; its leaves reach ctx.cortex
  harness.branch("/dialogue").open({ nature: "render", input: v.primitives.harness.Request }, async (ctx) => ctx.cortex.hallucinate.dialogue.render(await primed(ctx)));
  if (mode.module.harness) harness.graft(mode.module.harness);
  …
  return () => { mode.harness = shape.object(harness, steer.strategy.echo); mode.aperture.branch("/harness", harness); };
```
```js
// commons/instances/hello-world/tools/research.js:19 — a tool re-enters the harness; the HARNESS owns turns, fork, catalog, persistence
export const investigate = async (ctx) => ctx.mode.harness.dialogue.stream({ thread: ctx.thread, parts: [...], system: { brief: BRIEF }, config: { rounds: ROUNDS }, controller: ctx.controller?.branch("dialogue") });
```
```js
// systems/runtime/gestalten/tools/thread.js:27 — the volatile primer row the model reads every turn: thread · mode · buffers on this thread
export const summary = async ({ modes, entities, mode, thread }) => { … `[Buffers on this thread] · ${buffers.length} · rows: index · id · label · mode · status · mime · data` … };
export const primer = new Vector().open("thread", summary);
```

`tune · rounds · effort` are the USER's (`INTELLIGENT` on the thread), never the mode's (skill `mode`). The root harness is two files + a runtime row (m117, `commons/harnesses/runtime/`).

## 7. the package shape (skill `package` · `mode`)

```
~/.viva/registry/<pkg>/
  package.viva.js                         { type:"package", slug, owner:"@<slug>", version, traits:[] }
  modes/<type>/<slug>/<slug>.viva.js      manifest · buffer · views · aperture · tools · harness · primer
  modes/<type>/<slug>/buffer/<Name>.svelte
  instances/<slug>/instance.viva.json     the template instance/create copies
  tests/rig.js
```

No import leaves the mode's directory; deps by URL; tests run with the repo's `deno.jsonc`. A mode guesses nothing — no default model, no default size; only `.desc` examples are concrete.

## 8. what is missing — the gaps, each a milestone

| # | gap | where | size |
|---|---|---|---|
| 1 | a `picture` FACULTY type + avenue (`Hallucination.picture`, `Policy.picture`, cortex branch, host list, HARNESSED leaf); `movie · sound · embedding` reserved (his 11-08 ruling) | typology HOLY · runtime | 5 files |
| 2 | two picture providers as hallucinators + ledger rows + secrets | `commons/hallucinators/` · `~/.viva/ledger.viva.json` · `.env` | 2 packages |
| 3 | a tool result that SHOWS: `Part.ToolResult` + `translate.js` ×2 image blocks | typology HOLY · commons | 3 files |
| 4 | provenance on a File: a trait `{prompt, provider, model, parent, references, mask}` on `v.file.traits` | typology HOLY | 1 file |
| 5 | the mode: routes · tools · harness · primer · settle under `images/` · references | registry package | ~10 files |
| 6 | the view: canvas · versions · references tray · region → mask · compare · drop | registry package | ~6 files |
| 7 | a thumbnail: no resizer in the tree; a full image in every tool result re-bills every turn | provider `size` or a pure-JS resize | fork |
| 8 | a tty face (kitty graphics) | ghost | deferred |
