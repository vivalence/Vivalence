<script>
  import { getContext, onDestroy } from "svelte";
  import { LiteralLabel, TraceEntry } from "../../surface/inspector/index.js";

  const terminal = getContext("terminal");
  const daemon = terminal.$daemon;
  const queue = terminal.stall.$queue;
  const active = terminal.stall.$active;

  let { open = $bindable(false) } = $props();
  let tab = $state("buffers");
  let expanded = $state(null);
  let pollTimer = null;

  // ── mode name ──
  function modeName(buffer) {
    if (!buffer || !$daemon) return "—";
    const modeId = typeof buffer.mode === "string" ? buffer.mode : buffer.mode?.id;
    if (!modeId) return "?";
    const found = $daemon.entities.mode.$entities.get().find((m) => m.id === modeId);
    return found?.manifest?.name ?? found?.slug ?? modeId.slice(0, 8);
  }

  // ── buffer ops ──
  function selectBuffer(index) {
    const q = [...$queue];
    const selected = q.splice(index, 1)[0];
    const current = terminal.stall.$active.get();
    if (current) q.unshift(current);
    terminal.stall.$active.set(selected);
    terminal.stall.$queue.set(q);
  }

  function skipBuffer(index) {
    const q = [...$queue];
    q.splice(index, 1);
    terminal.stall.$queue.set(q);
  }

  function toggleExpand(id) {
    expanded = expanded === id ? null : id;
  }

  // ── dnd reorder ──
  let drag = $state(null);

  function reorder(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    const q = [...$queue];
    const [item] = q.splice(fromIdx, 1);
    q.splice(toIdx, 0, item);
    terminal.stall.$queue.set(q);
  }

  function onPointerDown(index, event) {
    if (!event.target.closest(".bi-handle")) return;
    drag = { index, overIndex: index, pointerId: event.pointerId };
    event.target.closest(".bi-queue-item").setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!drag) return;
    const container = event.currentTarget.closest(".bi-queue");
    if (!container) return;
    const items = container.querySelectorAll(".bi-queue-item");
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        drag = { ...drag, overIndex: i };
        return;
      }
    }
    drag = { ...drag, overIndex: items.length - 1 };
  }

  function onPointerUp() {
    if (drag) {
      reorder(drag.index, drag.overIndex);
      drag = null;
    }
  }

  // ── traces ──
  let traces = $state([]);

  async function pollTraces() {
    if (!$daemon) return;
    try {
      traces = await $daemon.entities.trace.find(
        {},
        { orderBy: { createdAt: "DESC" }, limit: 30, populate: ["literal"] },
      );
    } catch (error) {
      console.error("[inspector] trace poll", error);
    }
  }

  function switchTab(t) {
    tab = t;
    if (t === "traces") {
      pollTraces();
      if (!pollTimer) pollTimer = setInterval(pollTraces, 5000);
    } else if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onDestroy(() => {
    if (pollTimer) clearInterval(pollTimer);
  });
</script>

{#if open}
  <div class="bi-backdrop" role="presentation" onclick={() => (open = false)}></div>
  <div class="bi-panel" onclick={(e) => e.stopPropagation()}>
    <div class="bi-tabs">
      <button class="bi-tab" class:active={tab === "buffers"} onclick={() => switchTab("buffers")}>buffers</button>
      <button class="bi-tab" class:active={tab === "traces"} onclick={() => switchTab("traces")}>traces</button>
    </div>
    <div class="bi-body">
      {#if tab === "buffers"}
        {#if $active}
          <div class="bi-section-label">active</div>
          <div class="bi-item bi-item-active">
            <span class="bi-dot active"></span>
            <span class="bi-item-name">{modeName($active)}</span>
            <span class="bi-item-count">{$active.literals?.length ?? 0} lit</span>
            <button class="bi-btn-expand" onclick={() => toggleExpand($active.id)}>
              {expanded === $active.id ? "▾" : "▸"}
            </button>
          </div>
          {#if expanded === $active.id && $active.literals?.length}
            <div class="bi-literals">
              {#each $active.literals as literal}
                <LiteralLabel {literal} />
              {/each}
            </div>
          {/if}
        {/if}

        {#if $queue.length > 0}
          <div class="bi-section-label">queue · {$queue.length}</div>
          <div class="bi-queue">
            {#each $queue as buffer, index (buffer.id ?? index)}
              <div
                class="bi-queue-item"
                class:bi-drag-over={drag?.overIndex === index && drag?.index !== index}
                data-queue-index={index}
                onpointerdown={(e) => onPointerDown(index, e)}
                onpointermove={onPointerMove}
                onpointerup={onPointerUp}>
                <span class="bi-handle" title="drag to reorder">⠿</span>
                <button class="bi-item-select" onclick={() => selectBuffer(index)}>
                  <span class="bi-dot"></span>
                  <span class="bi-item-name">{modeName(buffer)}</span>
                  <span class="bi-item-count">{buffer.literals?.length ?? 0}</span>
                </button>
                <button class="bi-btn-expand" onclick={() => toggleExpand(buffer.id ?? `q${index}`)}>
                  {expanded === (buffer.id ?? `q${index}`) ? "▾" : "▸"}
                </button>
                <button class="bi-btn-skip" onclick={() => skipBuffer(index)}>✕</button>
              </div>
              {#if expanded === (buffer.id ?? `q${index}`) && buffer.literals?.length}
                <div class="bi-literals">
                  {#each buffer.literals as literal}
                    <LiteralLabel {literal} />
                  {/each}
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <div class="bi-empty">queue empty</div>
        {/if}

      {:else if tab === "traces"}
        {#if traces.length === 0}
          <div class="bi-empty">no traces yet</div>
        {:else}
          {#each traces as trace (trace.id)}
            <TraceEntry {trace} />
          {/each}
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ── backdrop + panel ── */
  .bi-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 90;
    -webkit-tap-highlight-color: transparent;
  }

  .bi-panel {
    position: fixed;
    bottom: calc(52px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    max-height: 60vh;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 91;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  }

  @media (min-width: 768px) {
    .bi-panel {
      bottom: 40px;
      left: auto;
      right: 0;
      max-width: 600px;
      border-radius: 8px 0 0 0;
    }
  }

  /* ── tabs ── */
  .bi-tabs {
    display: flex;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    flex-shrink: 0;
  }

  .bi-tab {
    flex: 1;
    height: 44px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--colors-skeleton-2-contrast);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  @media (min-width: 768px) {
    .bi-tab { height: 36px; }
  }

  .bi-tab.active {
    color: var(--colors-skeleton-1-contrast);
    border-bottom-color: var(--colors-theme-primary-contrast);
  }

  /* ── body ── */
  .bi-body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 4px 0 8px;
    flex: 1;
  }

  .bi-section-label {
    padding: 12px 16px 6px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--colors-theme-primary-contrast);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bi-empty {
    padding: 48px 16px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    text-align: center;
  }

  /* ── active buffer ── */
  .bi-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
  }

  @media (min-width: 768px) {
    .bi-item { padding: 6px 16px; }
  }

  .bi-item-active {
    background: color-mix(in srgb, var(--colors-theme-primary-surface) 20%, transparent);
  }

  .bi-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-2-contrast);
    flex-shrink: 0;
  }

  .bi-dot.active {
    background: var(--colors-theme-primary-contrast);
  }

  .bi-item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bi-item-count {
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    flex-shrink: 0;
    min-width: 2ch;
    text-align: right;
  }

  .bi-btn-expand {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--colors-skeleton-2-contrast);
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .bi-btn-skip {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--colors-skeleton-2-contrast);
    cursor: pointer;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .bi-btn-expand:hover, .bi-btn-skip:hover {
    color: var(--colors-skeleton-1-contrast);
  }

  .bi-btn-skip:hover {
    color: var(--colors-system-error-contrast);
  }

  /* ── queue items ── */
  .bi-queue-item {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 4px 0 4px 0;
    min-height: 44px;
    touch-action: none;
  }

  @media (min-width: 768px) {
    .bi-queue-item { min-height: 28px; }
  }

  .bi-queue-item:hover {
    background: var(--colors-skeleton-2-surface);
  }

  .bi-drag-over {
    border-top: 2px solid var(--colors-theme-primary-contrast);
  }

  .bi-handle {
    font-size: 18px;
    color: var(--colors-skeleton-2-contrast);
    cursor: grab;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .bi-handle:active {
    cursor: grabbing;
    color: var(--colors-skeleton-1-contrast);
  }

  .bi-item-select {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    font: inherit;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
    cursor: pointer;
    text-align: left;
    padding: 4px 0;
    -webkit-tap-highlight-color: transparent;
  }

  @media (min-width: 768px) {
    .bi-item-select { font-size: var(--font-size-sm); }
  }

  /* ── expanded literals ── */
  .bi-literals {
    padding: 4px 16px 10px 40px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: var(--font-size-xs);
  }
</style>
