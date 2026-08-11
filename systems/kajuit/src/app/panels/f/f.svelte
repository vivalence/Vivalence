<script module>
  import { ThreadTraits } from "@vivalence/kajuit";

  const modeLabel = (buffer) => buffer.mode?.slug ?? buffer.mode?.id ?? buffer.mode ?? "—";

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
  import { chain, stores } from "@vivalence/kajuit";
  import { Section } from "@vivalence/drapes";
  import { logger } from "$telemetry";
  import { TERMINALS } from "$client";

  const terminals = getContext(TERMINALS);

  const terminal = chain(terminals, "$active");
  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const activeBuffer = chain(terminals, "$active", "$buffer");
  const activeData = chain(terminals, "$active", "$buffer", "$data");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const phase = chain(terminals, "$active", "$thread", "$phase");

  let busy = $state(false);
  let listEl = $state(null);

  const dock = chain(terminals, "$active", "$dock");

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

</script>

<div class="panel">
  {#if harnessed}
    <section>
      <Section label="chat" />
      <button
        class="act primary"
        class:engaged={!$dock?.collapsed}
        onclick={() => stores.bridge.setDockCollapsed(terminals.active?.$dock)}
        disabled={!$thread}>
        {$dock?.collapsed ? "start chatting" : "hide chat"}
      </button>
    </section>
  {/if}

  <section>
    {#if application || queueing}
      <Section label="buffer" />
      {#if !$thread}
        <div class="empty">no thread</div>
      {:else if queueing}
        <div class="queue">
          <button
            class="queuekey"
            class:on={$phase === "continuous"}
            onclick={() => startQueue($terminal)}>start</button>
          <button
            class="queuekey"
            class:on={$phase === "manual"}
            onclick={() => stopQueue($terminal)}>stop</button>
        </div>
      {:else if aimed}
        <button class="act primary" onclick={onCreate} disabled={busy}
          >{busy ? "…" : "Open"}</button>
      {:else if standalone && application}
        <button class="act primary" onclick={onCreate} disabled={busy}
          >{busy ? "…" : "Open"}</button>
      {:else}
        <button class="act" disabled title="this mode has no emitter — toggle AIMED to pull"
          >aim required</button>
      {/if}
    {/if}
  </section>

  {#if ordered.length}
    <section>
      <Section label="buffers" count={ordered.length}>
        {#snippet action()}
          <button
            class="mini"
            onclick={() => clearBuffers($terminal, $thread)}
            disabled={!ordered.length}>clear</button>
        {/snippet}
      </Section>
      <div class="blist" bind:this={listEl}>
        {#each ordered as buffer (buffer.id)}
          <div class="brow" class:on={$activeBuffer?.id === buffer.id} data-id={buffer.id}>
            <button class="cell" onclick={() => activateBuffer($terminal, buffer)}>
              <span class="index">{buffer.index ?? 0}</span>
              <!-- <span class="status">{buffer.status ?? "PENDING"}</span> -->
              <span class="slug">{modeLabel(buffer)}</span>
            </button>
            <button class="x" onclick={() => deleteBuffer($terminal, $thread, buffer)} title="delete"
              >✕</button>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if $activeBuffer}
    <section>
      <Section label="active buffer" />
      <div class="kv">
        <span class="k">mode</span><span class="v">{modeLabel($activeBuffer)}</span>
      </div>
      <div class="kv">
        <span class="k">literals</span><span class="v">{$activeBuffer.literals?.length ?? 0}</span>
      </div>
      <div class="kv">
        <span class="k">symbols</span><span class="v">{$activeBuffer.symbols?.length ?? 0}</span>
      </div>
      {#if $activeBuffer.literals?.length}
        {#each $activeBuffer.literals as literal}
          <div class="item">{literal.slug ?? literal.ontology ?? literal.id}</div>
        {/each}
      {/if}
      <div class="kv top"><span class="k">data</span></div>
      <pre class="json">{JSON.stringify($activeData ?? {}, null, 2)}</pre>
    </section>
  {/if}
</div>

<style>
  .panel {
    min-width: 250px;
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    letter-spacing: 0.02em;
    padding: 14px 14px 18px;
    box-sizing: border-box;
  }
  section {
    margin-bottom: 16px;
  }
  section :global(.section-head) {
    margin-bottom: 10px;
  }
  .empty {
    opacity: 0.3;
    padding: 2px 2px;
  }
  .queue {
    display: flex;
    width: max-content;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    overflow: hidden;
  }
  .queuekey {
    padding: 6px 14px;
    background: transparent;
    border: none;
    color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 55%, transparent);
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .queuekey + .queuekey {
    border-left: 1px solid var(--colors-skeleton-3-boundary);
  }
  .queuekey:hover {
    color: var(--colors-skeleton-3-contrast);
    background: color-mix(in srgb, var(--colors-skeleton-3-contrast) 5%, transparent);
  }
  .queuekey.on {
    color: var(--colors-skeleton-0-primary-base);
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 12%, transparent);
  }
  .act {
    padding: 7px 14px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 70%, transparent);
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .act:hover:not(:disabled) {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 6%, transparent);
  }
  .act:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .act.primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 9px;
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
    color: var(--colors-skeleton-0-primary-base);
  }
  .act.primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 9%, transparent);
  }
  .act.engaged {
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .act.engaged:hover:not(:disabled) {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
    background: transparent;
  }
  .mini {
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.4;
    cursor: pointer;
  }
  .mini:hover:not(:disabled) {
    opacity: 0.8;
  }
  .mini:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
  .kv {
    display: flex;
    gap: 8px;
    padding: 1px 0;
  }
  .kv.top {
    padding-top: 5px;
  }
  .k {
    min-width: 64px;
    opacity: 0.5;
  }
  .v {
    color: var(--colors-skeleton-0-primary-base);
  }
  .item {
    opacity: 0.7;
    padding-left: 64px;
    font-size: var(--font-size-2xs);
  }
  .json {
    margin: 2px 0 0;
    font-size: var(--font-size-2xs);
    opacity: 0.55;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .blist {
    max-height: 320px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .brow {
    display: flex;
    align-items: stretch;
    border-radius: 2px;
  }
  .brow.on {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 10%, transparent);
  }
  .brow:hover {
    background: color-mix(in srgb, var(--colors-skeleton-3-contrast) 5%, transparent);
  }
  .cell {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 5px 2px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .index {
    opacity: 0.3;
    width: 10px;
    flex: none;
    font-size: var(--font-size-xs);
      margin-right: 6px;
  }
  .status {
    padding: 1px 7px;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-warning-base) 45%, transparent);
    border-radius: 2px;
    font-size: var(--font-size-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--colors-skeleton-0-warning-base);
    flex: none;
  }
  .slug {
    flex: 1;
    color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 85%, transparent);
  }
  .x {
    padding: 0 9px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    opacity: 0.35;
  }
  .x:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-danger-base);
  }
</style>
