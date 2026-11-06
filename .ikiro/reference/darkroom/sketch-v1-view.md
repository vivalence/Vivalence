<!-- limit: 8000 chars · the desk view as sketched BEFORE his comp (11-08), moved whole from m118-darkroom.org `* as code` when the comp replaced it · never affirmed · quest: .ikiro/quests/m118-darkroom.org -->
# sketch v1 — the desk view before the comp

***** buffer/Darkroom.svelte

#+BEGIN_SRC svelte
<script>
  import Canvas from "./parts/Canvas.svelte";
  import Strip from "./parts/Strip.svelte";
  import Tray from "./parts/Tray.svelte";
  import Batch from "./parts/Batch.svelte";

  const { terminal, buffer } = $props();
  const data = buffer.$data;
  const files = terminal.client.runtime.entities.file.$entities;

  const mine = $derived($files.filter((file) => file.mode.id === buffer.mode.id));
  const byId = $derived(new Map(mine.map((file) => [file.id, file])));
  const pictures = $derived(mine.filter((file) => file.traits.includes("DEVELOPED")).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  const shown = $derived(byId.get($data.shown) ?? null);
  const compare = $derived(byId.get($data.compare) ?? null);

  const call = (route, input) => buffer.mode.call.picture[route]({ buffer: buffer.id, ...input });
  const show = (file) => call("show", { picture: file.id });
  const vary = (file, strength) => call("vary", { picture: file.id, strength });
  const bind = (file, role) => call("reference", { file: file.id, role });
  const drop = (file) => call("reference", { file: file.id });
  const patch = (data) => terminal.client.runtime.entities.buffer.updateOne({ id: buffer.id }, { data });

  async function select(rectangle, maskBytes) {
    const mask = await buffer.mode.call.files.receive({ path: `masks/${crypto.randomUUID()}.png`, bytes: maskBytes, mime: "image/png" });
    await patch({ ...$data, selection: { ...rectangle, mask: mask.id } });
  }

  async function dropped(browserFile) {
    const bytes = new Uint8Array(await browserFile.arrayBuffer());
    const reference = await buffer.mode.call.files.receive({ path: `references/${browserFile.name}`, bytes, mime: browserFile.type });
    await bind(reference, "style");
  }
</script>

<div class="desk">
  <Canvas {shown} {compare} selection={$data.selection} onselect={select} onclear={() => patch({ ...$data, selection: undefined })} />
  <aside class="rail">
    <Tray references={$data.references.map((reference) => ({ ...reference, file: byId.get(reference.file) }))} onbind={bind} ondrop={drop} ondropped={dropped} />
    <Batch files={$data.batch.map((id) => byId.get(id)).filter(Boolean)} {shown} onshow={show} onvary={vary} />
  </aside>
  <Strip {pictures} {shown} onshow={show} oncompare={(file) => call("show", { picture: $data.shown, compare: file.id })} />
</div>

<style>
  .desk { display: grid; grid-template: 1fr auto / 1fr 18rem; height: 100%; gap: var(--gap-2); }
  .rail { display: flex; flex-direction: column; gap: var(--gap-2); overflow-y: auto; }
</style>
#+END_SRC

Tokens, never hexes (law); the parts (=Canvas= · =Strip= · =Tray= · =Batch=) on go, after the chrome's =parts.css= is read for the token names. =/files/receive= over the wire with a =Uint8Array= body: the media editor streams the request BODY (=/media/ingest=) — the route for a drop is that shape, =x-viva-name= naming it; tangle on go, media's =upload.js= read first.

