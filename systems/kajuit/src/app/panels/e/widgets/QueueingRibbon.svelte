<script>
  import Row from "./Row.svelte";

  let { thread } = $props();

  let buffers = $state([]);
  let teardown;

  $effect(() => {
    teardown?.();
    if (!thread?.$buffers) {
      buffers = [];
      return;
    }
    teardown = thread.$buffers.subscribe((value) => (buffers = value ?? []));
    return () => teardown?.();
  });

  let pending = $derived(buffers.filter((b) => !b.status || b.status === "PENDING"));
  let active = $derived(buffers.filter((b) => b.status === "ACTIVE"));
  let done = $derived(buffers.filter((b) => b.status === "DONE"));
  let depth = $derived(thread?.trait?.QUEUEING?.depth ?? 1);
  let saving = $state(false);

  async function setDepth(value) {
    if (!thread || saving) return;
    const next = Math.max(0, Math.min(10, Number(value) || 0));
    saving = true;
    try {
      await thread.daemon.entities.thread.updateOne(
        { id: thread.id },
        { trait: { ...thread.trait, QUEUEING: { ...(thread.trait?.QUEUEING ?? {}), depth: next } } },
      );
    } finally {
      saving = false;
    }
  }

  function advance() {
    thread?.queue?.next();
  }
  function pull() {
    thread?.queue?.pull();
  }
</script>

<Row letter="Q" name="queueing · ribbon" status="depth · {depth}" statusKind="live">
  <div class="ribbon">
    <div class="lane">
      <span class="lane-label">pending</span>
      <span class="lane-cells">
        {#each pending as _}
          <span class="cell pending"></span>
        {/each}
        {#if !pending.length}<span class="muted small">—</span>{/if}
      </span>
      <span class="lane-count">{pending.length}</span>
    </div>
    <div class="lane">
      <span class="lane-label">active</span>
      <span class="lane-cells">
        {#each active as _}
          <span class="cell active"></span>
        {/each}
        {#if !active.length}<span class="muted small">—</span>{/if}
      </span>
      <span class="lane-count">{active.length}</span>
    </div>
    <div class="lane">
      <span class="lane-label">done</span>
      <span class="lane-cells">
        {#each done as _}
          <span class="cell done"></span>
        {/each}
        {#if !done.length}<span class="muted small">—</span>{/if}
      </span>
      <span class="lane-count">{done.length}</span>
    </div>
  </div>
  <div class="kv">
    <span class="k">depth</span>
    <input
      type="range"
      min="0"
      max="10"
      value={depth}
      onchange={(e) => setDepth(e.currentTarget.value)}
      class="slider" />
    <span class="muted small">{depth}</span>
  </div>

  {#snippet footer()}
    <button class="btn" onclick={advance} disabled={!thread?.queue}>advance</button>
    <button class="btn" onclick={pull} disabled={!thread?.queue}>pull</button>
  {/snippet}
</Row>

<style>
  .ribbon {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .lane {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-2xs);
  }
  .lane-label {
    min-width: 56px;
    opacity: 0.5;
    text-transform: lowercase;
  }
  .lane-cells {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: center;
  }
  .lane-count {
    width: 24px;
    text-align: right;
    opacity: 0.5;
    font-size: var(--font-size-2xs);
  }
  .cell {
    width: 8px;
    height: 8px;
    border-radius: 1px;
    border: 1px solid var(--colors-skeleton-0-boundary);
  }
  .cell.pending {
    background: color-mix(in srgb, var(--colors-skeleton-0-warning-base) 30%, transparent);
    border-color: var(--colors-skeleton-0-warning-base);
  }
  .cell.active {
    background: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .cell.done {
    background: color-mix(in srgb, var(--colors-skeleton-2-contrast) 20%, transparent);
    border-color: color-mix(in srgb, var(--colors-skeleton-2-contrast) 40%, transparent);
  }
  .kv {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 4px;
  }
  .k {
    min-width: 56px;
    opacity: 0.5;
    font-size: var(--font-size-2xs);
  }
  .slider {
    flex: 1;
  }
  .muted {
    opacity: 0.4;
  }
  .small {
    font-size: var(--font-size-2xs);
  }
  .btn {
    padding: 1px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
    opacity: 0.6;
  }
  .btn:hover:not(:disabled) {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }
</style>
