<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, THREAD, BRIDGE } from "$client";
  import { skins } from "@vivalence/drapes";
  const { Filter, List } = skins;
  import { compose, narrow } from "./navigation.js";

  const lighthouseInstance = getContext(LIGHTHOUSE);
  const threadInstance = getContext(THREAD);
  const bridge = getContext(BRIDGE);

  let view = $state(bridge.view.d);
  let threads = $state([]);
  let modes = $state([]);
  let intents = $state([]);
  let query = $state("");
  let error = $state(null);

  lighthouseInstance.$daemons.subscribe(async (list) => {
    if (!list.length) return;
    try {
      const result = await compose(lighthouseInstance, threadInstance);
      threads = result.threads;
      modes = result.modes;
      intents = result.intents;
      error = null;
    } catch (reason) {
      error = reason;
      console.error("[d.svelte] compose failed:", reason);
    }
  });

  const filteredThreads = $derived(narrow.narrow(query, threads, narrow.navigation));
  const filteredModes = $derived(narrow.narrow(query, modes, narrow.navigation));
  const filteredIntents = $derived(narrow.narrow(query, intents, narrow.navigation));
  const hasResults = $derived(
    filteredThreads.length + filteredModes.length + filteredIntents.length > 0,
  );

  let thread = $state(threadInstance.$current.get());
  let buffers = $state([]);
  let activeBuffer = $state(null);
  let stallStatus = $state(null);

  let teardownBuffers = null;
  let teardownActive = null;
  let teardownStatus = null;

  threadInstance.$current.subscribe((value) => {
    thread = value;
    if (teardownBuffers) {
      teardownBuffers();
      teardownBuffers = null;
    }
    if (teardownActive) {
      teardownActive();
      teardownActive = null;
    }
    if (teardownStatus) {
      teardownStatus();
      teardownStatus = null;
    }
    if (!value) {
      buffers = [];
      activeBuffer = null;
      stallStatus = null;
      return;
    }
    if (value.$buffers) teardownBuffers = value.$buffers.subscribe((b) => (buffers = b));
    if (value.$buffer) teardownActive = value.$buffer.subscribe((b) => (activeBuffer = b));
    if (value.queue?.$status)
      teardownStatus = value.queue.$status.subscribe((s) => (stallStatus = s));
  });

  let expandedBuffer = $state(null);

  function onNext() {
    thread?.queue?.next();
  }
  function onPull() {
    thread?.queue?.pull();
  }
  function onReset() {
    thread?.queue?.reset();
  }
  function toggleExpand(index) {
    expandedBuffer = expandedBuffer === index ? null : index;
  }
  function onClear() {
    if (!thread) return;
    thread.buffers = [];
    thread.$buffers?.set?.([]);
    thread.$buffer?.set?.(null);
    thread.counter = 0;
    thread.cursor = 0;
  }
</script>

<div class="panel">
  <div class="tab-bar">
    <button class="tab" class:active={view === "outside"} onclick={() => { view = "outside"; bridge.view.d = "outside"; bridge.save(); }}
      >outside</button>
    <button class="tab" class:active={view === "inside"} onclick={() => { view = "inside"; bridge.view.d = "inside"; bridge.save(); }}
      >inside</button>
  </div>

  {#if view === "outside"}
    <div class="filter-bar">
      <Filter bind:query placeholder="navigate..." />
    </div>

    <div class="sections">
      {#if error}
        <div class="error">{error.message}</div>
      {/if}

      {#if filteredThreads.length}
        <div class="section">
          <div class="section-header">threads</div>
          <List nodes={filteredThreads} />
        </div>
      {/if}

      {#if filteredIntents.length}
        <div class="section">
          <div class="section-header">intents</div>
          <List nodes={filteredIntents} />
        </div>
      {/if}

      {#if filteredModes.length}
        <div class="section">
          <div class="section-header">modes</div>
          <List nodes={filteredModes} />
        </div>
      {/if}

      {#if !hasResults && query}
        <div class="empty">no matches</div>
      {:else if !hasResults && !error}
        <div class="empty">no daemons</div>
      {/if}
    </div>
  {:else if thread}
    <div class="inside">
      <div class="section-header">traits</div>
      {#if thread.traits?.length}
        <div class="trait-list">
          {#each thread.traits as trait}
            <span class="trait-tag">{trait}</span>
          {/each}
        </div>
      {:else}
        <div class="empty">none</div>
      {/if}

      {#if thread.trait}
        {#each Object.entries(thread.trait) as [key, value]}
          <div class="trait-block">
            <div class="trait-key">{key}</div>
            <pre class="trait-value">{JSON.stringify(value, null, 2)}</pre>
          </div>
        {/each}
      {/if}

      <div class="section-header">
        buffers
        <span class="buffer-count">{buffers.length}</span>
        {#if stallStatus}
          <span
            class="stall-status"
            class:stall-error={stallStatus === "ERROR"}
            class:stall-pulling={stallStatus === "PULLING"}>{stallStatus.toLowerCase()}</span>
        {/if}
      </div>

      <div class="buffer-controls">
        <button class="ctrl" onclick={onNext} title="advance to next buffer">next</button>
        <button class="ctrl" onclick={onPull} title="trigger pull">pull</button>
        <button class="ctrl" onclick={onReset} title="reset stall">reset</button>
        <button class="ctrl ctrl-danger" onclick={onClear} title="clear all buffers">clear</button>
      </div>

      {#if buffers.length}
        <div class="buffer-list">
          {#each buffers as buffer, index}
            <button
              class="buffer-row"
              class:buffer-active={activeBuffer && buffer.id === activeBuffer.id}
              onclick={() => toggleExpand(index)}>
              <span class="buffer-index">{index}</span>
              <span
                class="buffer-status"
                class:done={buffer.status === "DONE"}
                class:active={buffer.status === "ACTIVE"}
                class:pending={!buffer.status || buffer.status === "PENDING"}
                >{buffer.status ?? "PENDING"}</span>
              <span class="buffer-type">{buffer.view?.url?.match(/\/(\w+)\/buffer\//)?.[1] ?? buffer.data?.recall ?? "—"}</span>
              <span class="buffer-slug">{buffer.literals?.[0]?.slug ?? buffer.literals?.[0]?.ontology ?? ""}</span>
            </button>
            {#if expandedBuffer === index}
              <div class="buffer-detail">
                {#if buffer.literals?.length}
                  <div class="detail-section">
                    <span class="detail-label">literals</span>
                    {#each buffer.literals as literal}
                      <div class="detail-item">
                        {literal.slug ??
                          literal.ontology ??
                          literal.id?.substring(literal.id.length - 8) ??
                          "—"}
                      </div>
                    {/each}
                  </div>
                {/if}
                {#if buffer.symbols?.length}
                  <div class="detail-section">
                    <span class="detail-label">symbols</span>
                    {#each buffer.symbols as symbol}
                      <div class="detail-item">
                        {typeof symbol === "string" ? symbol : (symbol.slug ?? symbol.id)}
                      </div>
                    {/each}
                  </div>
                {/if}
                {#if buffer.data}
                  <div class="detail-section">
                    <span class="detail-label">data</span>
                    <pre class="detail-json">{JSON.stringify(buffer.data, null, 2)}</pre>
                  </div>
                {/if}
                {#if !buffer.literals?.length && !buffer.symbols?.length && !buffer.data}
                  <div class="detail-empty">no content</div>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="empty">no buffers</div>
      {/if}

      <div class="section-header">counters</div>
      <div class="counter-row">
        <span class="counter-key">counter</span>
        <span class="counter-value">{thread.counter}</span>
        <span class="counter-key">cursor</span>
        <span class="counter-value">{thread.cursor}</span>
      </div>
    </div>
  {:else}
    <div class="empty">no active thread</div>
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.04em;
    display: flex;
    flex-direction: column;
  }
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
  }
  .tab {
    flex: 1;
    padding: 5px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    text-transform: lowercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0.4;
  }
  .tab:hover {
    opacity: 0.7;
  }
  .tab.active {
    opacity: 1;
    border-bottom-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .filter-bar {
    padding: 8px 8px 4px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
  }
  .sections {
    flex: 1;
    overflow-y: auto;
    padding: 0 0 8px;
  }
  .section-header {
    padding: 8px 10px 3px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
  }
  .error {
    padding: 8px 10px;
    color: var(--colors-skeleton-0-danger-base, #f44);
    font-size: 9px;
  }
  .inside {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0 8px;
  }
  .trait-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 2px 10px 8px;
  }
  .trait-tag {
    padding: 1px 5px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    font-size: 8px;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
  .trait-block {
    padding: 2px 10px;
  }
  .trait-key {
    font-size: 9px;
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.6;
    padding: 4px 0 1px;
  }
  .trait-value {
    margin: 0;
    font-size: 9px;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .buffer-count {
    opacity: 0.4;
    margin-left: 4px;
  }
  .stall-status {
    margin-left: 6px;
    padding: 0 4px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    font-size: 8px;
  }
  .stall-error {
    color: var(--colors-skeleton-0-danger-base);
    border-color: var(--colors-skeleton-0-danger-base);
  }
  .stall-pulling {
    color: var(--colors-skeleton-0-warning-base);
    border-color: var(--colors-skeleton-0-warning-base);
  }
  .buffer-controls {
    display: flex;
    gap: 4px;
    padding: 4px 10px 6px;
  }
  .ctrl {
    padding: 2px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 8px;
    letter-spacing: 0.06em;
    cursor: pointer;
    opacity: 0.6;
  }
  .ctrl:hover {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .ctrl-danger:hover {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  .buffer-list {
    display: flex;
    flex-direction: column;
  }
  .buffer-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    font-size: 9px;
    width: 100%;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .buffer-row:hover {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 30%, transparent);
  }
  .buffer-row.buffer-active {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
  }
  .buffer-index {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.3;
    min-width: 12px;
    font-size: 8px;
  }
  .buffer-status {
    padding: 0 4px;
    border-radius: 2px;
    font-size: 7px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid var(--colors-skeleton-0-boundary);
  }
  .buffer-status.active {
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .buffer-status.done {
    opacity: 0.3;
  }
  .buffer-status.pending {
    opacity: 0.5;
  }
  .buffer-type {
    color: var(--colors-skeleton-1-contrast);
    font-size: 9px;
  }
  .buffer-slug {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
    font-size: 8px;
    margin-left: auto;
    text-align: right;
  }
  .buffer-detail {
    padding: 2px 10px 6px 28px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
  }
  .detail-section {
    margin-bottom: 4px;
  }
  .detail-label {
    display: block;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
    padding: 2px 0 1px;
  }
  .detail-item {
    font-size: 9px;
    color: var(--colors-skeleton-1-contrast);
    padding: 0 0 1px;
    opacity: 0.7;
  }
  .detail-json {
    margin: 0;
    font-size: 8px;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .detail-empty {
    font-size: 8px;
    opacity: 0.3;
  }
  .counter-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    padding: 2px 10px 8px;
    font-size: 9px;
  }
  .counter-key {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
  }
  .counter-value {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
  }
</style>
