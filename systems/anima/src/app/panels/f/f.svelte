<script module>
  import { ThreadTraits } from "@vivalence/anima";

  const modeLabel = (buffer) => buffer.mode?.slug ?? buffer.mode?.id ?? buffer.mode ?? "—";
  const bufferName = (buffer) => buffer.label?.name ?? `buffer ${buffer.index ?? 0}`;

  async function createBuffer(terminal, thread) {
    if (thread.traits.includes("AIMED")) {
      const buffers = await ThreadTraits.aimed.pull(thread);
      terminal.buffer = buffers[0];
      // for i of buffers length: buffers[i].on.release(()=>terminal.buffer=buffers[i+1])
      return;
    }
    const { literal, literals, symbol, symbols, ...data } = thread.trait?.MASKED ?? {};

    terminal.buffer = await thread.daemon.entities.buffer.create({
      mode: thread.mode?.id ?? thread.mode,
      thread: thread.id,
      data,
      literals: [...(literals ?? []), ...(literal ? [literal] : [])],
      symbols: [...(symbols ?? []), ...(symbol ? [symbol] : [])],
    });

    // terminal.buffer.on.release(()=>())
  }

  // the queue is now just a phase write — the stall reads thread.pull (AIMED) + depth itself.
  function startQueue(terminal) {
    setThreadPhase(terminal, "continuous");
  }

  function stopQueue(terminal) {
    setThreadPhase(terminal, "manual");
  }

  function setThreadPhase(terminal, phase) {
    const thread = terminal?.thread;
    if (!thread?.engage(phase)) return; // refused → $errors set; don't persist a bad phase
    thread.daemon.entities.thread.updateOne({ id: thread.id }, { phase }); // persist
  }

  function activateBuffer(terminal, buffer) {
    terminal.buffer = terminal.buffer?.id === buffer.id ? null : buffer;
  }

  async function deleteBuffer(terminal, thread, buffer) {
    if (terminal.buffer?.id === buffer.id) terminal.buffer = null;
    await thread.daemon.entities.buffer.removeOne({ id: buffer.id });
  }

  async function clearBuffers(terminal, thread) {
    terminal.buffer = null;
    for (const buffer of thread.$buffers.get()) thread.daemon.entities.buffer.drop(buffer.id);
    await thread.daemon.entities.buffer.remove({ thread: thread.id });
  }
</script>

<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { Key, Reading, Row, Section, Status, Well } from "@vivalence/drapes";
  import ActivitySection from "./widgets/ActivitySection.svelte";
  import { logger } from "$telemetry";
  import { TERMINALS } from "$client";

  const terminals = getContext(TERMINALS);

  const terminal = chain(terminals, "$active");
  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const activeBuffer = chain(terminals, "$active", "$buffer");
  const activeData = chain(terminals, "$active", "$buffer", "$data");
  const activeLabel = chain(terminals, "$active", "$buffer", "$label");
  const activeView = chain(terminals, "$active", "$buffer", "$view");
  const served = chain(terminals, "$active", "$thread", "$mode", "$application");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const phase = chain(terminals, "$active", "$thread", "$phase");

  let busy = $state(false);
  let listEl = $state(null);
  let showData = $state(false);

  // keep the active row centered in the scrollable list
  $effect(() => {
    const id = $activeBuffer?.id;
    if (!id || !listEl) return;
    listEl.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ block: "center" });
  });

  const ordered = $derived([...($buffers ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)));
  const queueing = $derived($threadTraits?.includes("QUEUEING") ?? false);
  const aimed = $derived($threadTraits?.includes("AIMED") ?? false);
  const standalone = $derived($mode?.implements?.("STANDALONE") ?? false);
  const application = $derived($mode?.implements?.("APPLICATION") ?? false);
  const harnessed = $derived($mode?.implements?.("HARNESSED") ?? false);

  async function onCreate() {
    if (!$thread || busy) return;
    busy = true;
    try {
      await createBuffer($terminal, $thread);
    } catch (error) {
      logger.entry(`buffers/${$thread.id}`).fault(error);
    } finally {
      busy = false;
    }
  }

  const CONTROLS = {
    inert: [],
    manual: ["prev", "next"],
    continuous: ["more", "stop"],
    escort: ["prev", "next", "home"],
  };
  const LABEL = { prev: "previous", next: "next", home: "home", more: "more", stop: "stop → manual" };
  const TONES = { PENDING: "idle", ACTIVE: "primary", DONE: "positive", ERROR: "negative", STALE: "caution" };

  const seated = $derived(ordered.findIndex((buffer) => buffer.id === $activeBuffer?.id));
  const openable = $derived(aimed || (standalone && application));
  const drawn = $derived($activeView ?? $served?.view ?? null);

  function place(buffer) {
    const held = terminals.active;
    if (held) held.buffer = buffer;
  }

  function step(delta) {
    if (!ordered.length) return;
    place(ordered[(Math.max(seated, 0) + delta + ordered.length) % ordered.length] ?? null);
  }

  const VERBS = {
    prev: () => step(-1),
    next: () => step(1),
    home: () => place(ordered[0] ?? null),
    more: () => ThreadTraits.aimed.pull($thread).catch((error) => logger.entry(`buffers/${$thread.id}`).fault(error)),
    stop: () => stopQueue($terminal),
  };

  function discard(event, buffer) {
    event.stopPropagation();
    deleteBuffer($terminal, $thread, buffer);
  }
</script>

<div class="stall">
  <div class="stall-part">
    <Section label="cursor" count="{seated < 0 ? '–' : seated + 1} / {ordered.length}" />
    {#if $activeBuffer}
      <div class="stall-face">
        <Status tone={TONES[$activeBuffer.status] ?? "none"} word={$activeBuffer.status?.toLowerCase() ?? null} live={$activeBuffer.status === "ACTIVE"} />
        <span class="stall-title">{$activeLabel?.name ?? `buffer ${$activeBuffer.index ?? 0}`}</span>
      </div>
      <div class="stall-readings">
        <Reading label="buffer">{$activeBuffer.index ?? 0} · {String($activeBuffer.id).slice(-8)}</Reading>
        {#if $activeLabel?.description}<Reading label="description"><span title={$activeLabel.description}>{$activeLabel.description}</span></Reading>{/if}
        <Reading label="mode">{modeLabel($activeBuffer)}</Reading>
        <Reading label="view">{drawn ? `${$activeView ? "drawn" : "application"} · ${drawn.mount?.nature ?? drawn.kind ?? "—"}` : "—"}</Reading>
        <Reading label="literals">
          {$activeBuffer.literals?.length ?? 0}{#each $activeBuffer.literals ?? [] as literal} · {literal.slug ?? literal.ontology ?? literal.id}{/each}
        </Reading>
        <Reading label="symbols">{$activeBuffer.symbols?.length ?? 0}</Reading>
        <Reading label="data">
          <Key tone="ghost" size="mini" label={showData ? "hide" : `show · ${Object.keys($activeData ?? {}).length} keys`} onclick={() => (showData = !showData)} />
        </Reading>
      </div>
      {#if showData}
        <Well><pre class="stall-data">{JSON.stringify($activeData ?? {}, null, 2)}</pre></Well>
      {/if}
    {:else}
      <span class="stall-note">{ordered.length ? "cursor empty · pick a buffer below" : "no buffers · open or pull"}</span>
    {/if}

    {#if application || queueing}
      <div class="stall-verbs">
        {#each CONTROLS[$phase] ?? [] as verb (verb)}
          <Key size="row" label={verb} title={LABEL[verb]} onclick={VERBS[verb]} />
        {/each}
        <Key
          size="row"
          label="release"
          disabled={!$activeBuffer}
          title="release the cursor buffer · the stall advances"
          onclick={() => $activeBuffer?.release()} />
        {#if openable}
          <Key size="row" label={busy ? "…" : "open"} disabled={busy} title="pull through the mount when aimed, else create a buffer" onclick={onCreate} />
        {:else}
          <Key size="row" disabled label="aim required" title="this mode has no emitter — toggle AIMED to pull" />
        {/if}
        {#if $phase === "continuous"}
          <Key size="row" latched label="stop queue" title="engage manual" onclick={() => stopQueue($terminal)} />
        {:else}
          <Key size="row" muted={!queueing} label="start queue" title="engage continuous · needs aimed + queueing" onclick={() => startQueue($terminal)} />
        {/if}
      </div>
      {#if !openable}
        <span class="stall-aim">aim required · the thread is not aimed and the mode opens no buffer by itself · toggle aimed in the thread traits</span>
      {/if}
    {/if}
  </div>

  <div class="stall-part">
    <Section label="buffers" count={ordered.length}>
      {#snippet action()}
        <Key tone="ghost" size="mini" label="clear" disabled={!ordered.length} title="delete every buffer of this thread" onclick={() => clearBuffers($terminal, $thread)} />
      {/snippet}
    </Section>
    {#if !ordered.length}
      <span class="stall-note">no buffers · open or pull</span>
    {/if}
    <div class="stall-list" bind:this={listEl}>
      {#each ordered as buffer (buffer.id)}
        <div data-id={buffer.id}>
          <Row selected={$activeBuffer?.id === buffer.id} title={buffer.label?.description ?? ""} onclick={() => activateBuffer($terminal, buffer)}>
            <span class="stall-index">{buffer.index ?? 0}</span>
            <span class="stall-name">{bufferName(buffer)}</span>
            {#if buffer.status}<Status tone={TONES[buffer.status] ?? "none"} word={buffer.status.toLowerCase()} />{/if}
            <Key tone="ghost" size="mini" square label="✕" title="delete" onclick={(event) => discard(event, buffer)} />
          </Row>
        </div>
      {/each}
    </div>
  </div>

  {#if harnessed && $thread}
    <ActivitySection thread={$thread} />
  {/if}
</div>

<style>
  .stall {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-strong);
  }
  .stall-part {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .stall-face {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .stall-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-sm);
    font-weight: 600;
    color: var(--text-strong);
  }
  .stall-readings {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }
  .stall-data {
    margin: 0;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    line-height: var(--size-leading-loose);
    color: var(--text-ink);
    white-space: pre-wrap;
    word-break: break-all;
  }
  .stall-note {
    color: var(--text-light);
  }
  .stall-verbs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .stall-aim {
    color: var(--signal-caution-ink);
    line-height: var(--size-leading-loose);
  }
  .stall-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 320px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .stall-index {
    flex: none;
    width: 14px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .stall-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
