<script>
  let { thread } = $props();

  let buffers = $state([]);
  let activeBuffer = $state(null);
  let expandedBuffer = $state(null);
  let dragIndex = $state(null);
  let dragOverIndex = $state(null);

  let teardownBuffers = null;
  let teardownActive = null;

  $effect(() => {
    teardownBuffers?.();
    teardownActive?.();
    teardownBuffers = null;
    teardownActive = null;
    if (!thread) {
      buffers = [];
      activeBuffer = null;
      return;
    }
    if (thread.$buffers) teardownBuffers = thread.$buffers.subscribe((b) => (buffers = b));
    if (thread.$buffer) teardownActive = thread.$buffer.subscribe((b) => (activeBuffer = b));
    return () => {
      teardownBuffers?.();
      teardownActive?.();
    };
  });

  let ordered = $derived([...buffers].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)));

  function repo() {
    return thread?.daemon?.entities?.buffer;
  }

  function onNext() {
    thread?.queue?.next?.();
  }
  async function onClear() {
    if (!thread) return;
    await repo()?.remove({ thread: thread.id });
    thread.$buffer?.set?.(null);
  }
  function toggleExpand(id) {
    expandedBuffer = expandedBuffer === id ? null : id;
  }
  function onToggle(buffer) {
    const active = thread?.$buffer?.get?.();
    thread?.$buffer?.set?.(active?.id === buffer.id ? null : buffer);
  }
  async function onDelete(buffer) {
    await repo()?.removeOne({ id: buffer.id });
    if (thread?.$buffer?.get?.()?.id === buffer.id) thread.$buffer.set(null);
  }
  async function onDrop(toIndex) {
    const from = dragIndex;
    dragIndex = null;
    dragOverIndex = null;
    if (from == null || from === toIndex) return;
    const list = [...ordered];
    const [moved] = list.splice(from, 1);
    list.splice(toIndex, 0, moved);
    const bufferRepo = repo();
    await Promise.all(
      list
        .map((entry, index) =>
          entry.index === index ? null : bufferRepo?.updateOne({ id: entry.id }, { index }),
        )
        .filter(Boolean),
    );
  }
</script>

<div class="section-header">
  buffers
  <span class="buffer-count">{buffers.length}</span>
</div>

<div class="buffer-controls">
  <button class="ctrl" onclick={onNext} title="advance to next pending buffer">next</button>
  <button class="ctrl ctrl-danger" onclick={onClear} title="delete all buffers permanently"
    >clear</button>
</div>

{#if ordered.length}
  <div class="buffer-list">
    {#each ordered as buffer, position (buffer.id)}
      <div
        class="buffer-row"
        class:buffer-active={activeBuffer && buffer.id === activeBuffer.id}
        class:drag-over={dragOverIndex === position}
        ondragover={(event) => {
          event.preventDefault();
          dragOverIndex = position;
        }}
        ondragleave={() => {
          if (dragOverIndex === position) dragOverIndex = null;
        }}
        ondrop={() => onDrop(position)}
        role="listitem">
        <span
          class="drag-handle"
          draggable="true"
          ondragstart={() => (dragIndex = position)}
          ondragend={() => {
            dragIndex = null;
            dragOverIndex = null;
          }}
          role="button"
          tabindex="-1"
          title="drag to reorder">⠿</span>
        <button class="buffer-cell-main" onclick={() => onToggle(buffer)}>
          <span class="buffer-index">{buffer.index ?? 0}</span>
          <span
            class="buffer-status"
            class:done={buffer.status === "DONE"}
            class:active={buffer.status === "ACTIVE"}
            class:pending={!buffer.status || buffer.status === "PENDING"}
            >{buffer.status ?? "PENDING"}</span>
          <span class="buffer-type"
            >{buffer.view?.url?.match(/\/(\w+)\/buffer\//)?.[1] ?? "—"}</span>
          <span class="buffer-slug"
            >{buffer.literals?.[0]?.slug ?? buffer.literals?.[0]?.ontology ?? ""}</span>
        </button>
        <button
          class="buffer-expand"
          class:open={expandedBuffer === buffer.id}
          onclick={() => toggleExpand(buffer.id)}
          title="toggle details">{expandedBuffer === buffer.id ? "▾" : "▸"}</button>
        <button class="buffer-delete" onclick={() => onDelete(buffer)} title="delete buffer">✕</button>
      </div>
      {#if expandedBuffer === buffer.id}
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

{#if activeBuffer}
  <div class="active-divider">active</div>
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
          {literal.slug ?? literal.ontology ?? literal.id?.substring(literal.id.length - 8) ?? "—"}
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
    <div class="detail-empty padded">no content</div>
  {/if}
{/if}

<style>
  .section-header {
    padding: 8px 10px 3px;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
  }
  .buffer-count {
    opacity: 0.4;
    margin-left: 4px;
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
    font-size: var(--font-size-2xs);
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
    margin-right: 12px;
  }
  .buffer-row:hover {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 30%, transparent);
  }
  .buffer-row.buffer-active {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 8%, transparent);
  }
  .buffer-row.drag-over {
    box-shadow: inset 0 2px 0 var(--colors-skeleton-0-primary-base);
  }
  .drag-handle {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 6px;
    color: var(--colors-skeleton-2-contrast);
    font-size: var(--font-size-xs);
    opacity: 0.25;
    cursor: grab;
  }
  .drag-handle:hover {
    opacity: 0.7;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
  .buffer-cell-main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px 2px 0;
    font-size: var(--font-size-2xs);
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .buffer-expand,
  .buffer-delete {
    flex-shrink: 0;
    padding: 4px 11px;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-md);
    cursor: pointer;
    opacity: 0.35;
  }
  .buffer-expand:hover,
  .buffer-expand.open {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .buffer-delete:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-danger-base);
  }
  .buffer-index {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.3;
    min-width: 12px;
    font-size: var(--font-size-2xs);
  }
  .buffer-status {
    padding: 0 4px;
    border-radius: 2px;
    font-size: var(--font-size-2xs);
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
    font-size: var(--font-size-2xs);
  }
  .buffer-slug {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
    font-size: var(--font-size-2xs);
    margin-left: auto;
    text-align: right;
  }
  .buffer-detail {
    padding: 2px 10px 6px 28px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
  }
  .active-divider {
    padding: 10px 10px 3px;
    margin-top: 6px;
    border-top: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
  }
  .detail-section {
    margin-bottom: 4px;
  }
  .detail-section.padded {
    padding: 2px 10px;
  }
  .detail-label {
    display: block;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
    padding: 2px 0 1px;
  }
  .detail-item {
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-1-contrast);
    padding: 0 0 1px;
    opacity: 0.7;
  }
  .mode-type {
    font-size: var(--font-size-2xs);
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
    font-size: var(--font-size-2xs);
  }
  .detail-json {
    margin: 0;
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .detail-empty {
    font-size: var(--font-size-2xs);
    opacity: 0.3;
  }
  .detail-empty.padded {
    padding: 2px 10px;
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
  }
</style>
