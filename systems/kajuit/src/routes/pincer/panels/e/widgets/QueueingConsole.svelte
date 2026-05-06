<script>
  import Row from "./Row.svelte";

  let { thread } = $props();

  let status = $state("UNINITIALIZED");
  let active = $state(null);
  let buffers = $state([]);
  let stallError = $state(null);

  let teardownStatus;
  let teardownActive;
  let teardownError;
  let teardownBuffers;

  $effect(() => {
    teardownStatus?.();
    teardownActive?.();
    teardownError?.();
    teardownBuffers?.();
    if (!thread?.queue) {
      status = "UNINITIALIZED";
      active = null;
      buffers = [];
      stallError = null;
      return;
    }
    teardownStatus = thread.queue.$status.subscribe((value) => (status = value));
    teardownActive = thread.queue.$active.subscribe((value) => (active = value));
    teardownError = thread.queue.$error.subscribe((value) => (stallError = value));
    teardownBuffers = thread.$buffers?.subscribe?.((value) => (buffers = value ?? []));
    return () => {
      teardownStatus?.();
      teardownActive?.();
      teardownError?.();
      teardownBuffers?.();
    };
  });

  let depth = $derived(thread?.trait?.QUEUEING?.depth ?? 1);
  let pending = $derived(buffers.filter((b) => !b.status || b.status === "PENDING").length);
  let meterCells = $derived(Math.max(depth, pending, 1));

  const statusKindMap = {
    PULLING: "pulling",
    ERROR: "error",
    IDLE: "live",
    EXHAUSTED: "stub",
    CLOSED: "stub",
    UNINITIALIZED: "stub",
  };
  let statusKind = $derived(statusKindMap[status] ?? "idle");

  function next() {
    thread?.queue?.next();
  }
  function pull() {
    thread?.queue?.pull();
  }
  function reset() {
    thread?.queue?.reset();
  }
</script>

<Row letter="Q" name="queueing · console" status={status.toLowerCase()} {statusKind}>
  <div class="kv">
    <span class="k">depth</span>
    <span class="v">
      <span class="meter">
        {#each Array(meterCells) as _, i}
          <span class="cell" class:on={i < pending}></span>
        {/each}
      </span>
      <span class="muted small"> {pending} / {depth}</span>
    </span>
  </div>
  <div class="kv">
    <span class="k">active</span>
    <span class="v">
      {#if active}
        <span class="bid">{active.id?.slice?.(-12) ?? active.id}</span>
        <span class="muted small">· {active.status ?? "—"}</span>
      {:else}
        <span class="muted">none</span>
      {/if}
    </span>
  </div>
  {#if stallError}
    <div class="kv">
      <span class="k">error</span>
      <span class="v err">{stallError.message ?? String(stallError)}</span>
    </div>
  {/if}

  {#snippet footer()}
    <button class="btn" onclick={next} disabled={!thread?.queue}>next</button>
    <button class="btn" onclick={pull} disabled={!thread?.queue}>pull</button>
    <button class="btn" onclick={reset} disabled={!thread?.queue}>reset</button>
  {/snippet}
</Row>

<style>
  .kv {
    display: flex;
    gap: 8px;
  }
  .k {
    min-width: 70px;
    opacity: 0.5;
  }
  .v {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .meter {
    display: inline-flex;
    gap: 2px;
  }
  .cell {
    width: 10px;
    height: 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 1px;
  }
  .cell.on {
    background: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .bid {
    font-size: 9px;
    color: var(--colors-skeleton-1-contrast);
  }
  .muted {
    opacity: 0.4;
  }
  .small {
    font-size: 8px;
  }
  .err {
    color: var(--colors-skeleton-0-danger-base);
    font-size: 9px;
  }
  .btn {
    padding: 1px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: 8px;
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
