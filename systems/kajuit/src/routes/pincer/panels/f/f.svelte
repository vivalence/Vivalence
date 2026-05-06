<script>
  import { getContext } from "svelte";
  import { TOP, BRIDGE } from "$client";

  const top = getContext(TOP);
  const bridge = getContext(BRIDGE);

  let view = $state(bridge.view.f === "list" ? "buffers" : bridge.view.f);

  let currentThread = $state(top.current);
  let buffers = $state([]);
  let activeBuffer = $state(null);
  let stallStatus = $state(null);

  let teardownBuffers = null;
  let teardownActive = null;
  let teardownStatus = null;

  top.$current.subscribe((value) => {
    currentThread = value;
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
    currentThread?.queue?.next();
  }
  function onPull() {
    currentThread?.queue?.pull();
  }
  function toggleExpand(index) {
    expandedBuffer = expandedBuffer === index ? null : index;
  }
  function onActivate(buffer) {
    currentThread?.$buffer?.set?.(buffer);
  }
  function onClear() {
    if (!currentThread) return;
    currentThread.buffers = [];
    currentThread.$buffers?.set?.([]);
    currentThread.$buffer?.set?.(null);
    currentThread.queue?.$status?.set?.("IDLE");
  }
</script>

<div class="panel">
  <div class="tab-bar">
    <button class="tab" class:active={view === "buffers"} onclick={() => { view = "buffers"; bridge.view.f = "buffers"; bridge.save(); }}
      >buffers</button>
    <button class="tab" class:active={view === "buffer"} onclick={() => { view = "buffer"; bridge.view.f = "buffer"; bridge.save(); }}
      >buffer</button>
  </div>

  {#if !currentThread}
    <div class="empty">no active thread</div>
  {:else if view === "buffers"}
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
      <button class="ctrl ctrl-danger" onclick={onClear} title="clear buffers and active; ready for pull">clear</button>
    </div>

    {#if buffers.length}
      <div class="buffer-list">
        {#each buffers as buffer, index}
          <div
            class="buffer-row"
            class:buffer-active={activeBuffer && buffer.id === activeBuffer.id}>
            <button class="buffer-cell-main" onclick={() => toggleExpand(index)}>
              <span class="buffer-index">{index}</span>
              <span
                class="buffer-status"
                class:done={buffer.status === "DONE"}
                class:active={buffer.status === "ACTIVE"}
                class:pending={!buffer.status || buffer.status === "PENDING"}
                >{buffer.status ?? "PENDING"}</span>
              <span class="buffer-type">{buffer.view?.url?.match(/\/(\w+)\/buffer\//)?.[1] ?? "—"}</span>
              <span class="buffer-slug">{buffer.literals?.[0]?.slug ?? buffer.literals?.[0]?.ontology ?? ""}</span>
            </button>
            <button class="buffer-activate" onclick={() => onActivate(buffer)} title="set as active buffer">▶</button>
          </div>
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
  {:else if view === "buffer"}
    <div class="section-header">buffer</div>
    {#if activeBuffer}
      {#if activeBuffer.mode}
        <div class="detail-section padded">
          <span class="detail-label">mode</span>
          <div class="detail-item">
            <span class="mode-type">{activeBuffer.mode.type ?? ""}</span>
            <span class="mode-slug">{activeBuffer.mode.slug ?? "—"}</span>
            {#if activeBuffer.mode.name}<span class="mode-name">{activeBuffer.mode.name}</span>{/if}
          </div>
        </div>
      {/if}
      {#if activeBuffer.literals?.length}
        <div class="detail-section padded">
          <span class="detail-label">literals</span>
          {#each activeBuffer.literals as literal}
            <div class="detail-item">
              {literal.slug ??
                literal.ontology ??
                literal.id?.substring(literal.id.length - 8) ??
                "—"}
            </div>
          {/each}
        </div>
      {/if}
      {#if activeBuffer.symbols?.length}
        <div class="detail-section padded">
          <span class="detail-label">symbols</span>
          {#each activeBuffer.symbols as symbol}
            <div class="detail-item">
              {typeof symbol === "string" ? symbol : (symbol.slug ?? symbol.id)}
            </div>
          {/each}
        </div>
      {/if}
      {#if activeBuffer.data}
        <div class="detail-section padded">
          <span class="detail-label">data</span>
          <pre class="detail-json">{JSON.stringify(activeBuffer.data, null, 2)}</pre>
        </div>
      {/if}
      {#if !activeBuffer.literals?.length && !activeBuffer.symbols?.length && !activeBuffer.data}
        <div class="empty">no content</div>
      {/if}
    {:else}
      <div class="empty">no active buffer</div>
    {/if}
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.04em;
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
  .section-header {
    padding: 8px 10px 3px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
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
    align-items: stretch;
    width: 100%;
  }
  .buffer-row:hover {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 30%, transparent);
  }
  .buffer-row.buffer-active {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
  }
  .buffer-cell-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    font-size: 9px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .buffer-activate {
    flex-shrink: 0;
    padding: 2px 10px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: 10px;
    cursor: pointer;
    opacity: 0.35;
  }
  .buffer-activate:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
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
  .detail-section.padded {
    padding: 2px 10px;
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
  .mode-type {
    font-size: 7px;
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-right: 4px;
  }
  .mode-slug {
    color: var(--colors-skeleton-0-primary-base);
  }
  .mode-name {
    margin-left: 6px;
    opacity: 0.4;
    font-size: 8px;
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
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
    font-family: var(--font-family-code);
    font-size: 10px;
  }
</style>
