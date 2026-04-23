<script>
  import Row from "./Row.svelte";

  let { thread, terminal } = $props();

  const STATES = ["IDLE", "MOIN", "LIVE", "CLOSING", "CLOSED", "ERROR"];
  const READY_STATE = ["connecting", "open", "closing", "closed"];

  let sessionState = $state("—");
  let sessionError = $state(null);
  let socketReady = $state(null);
  let busy = $state(false);
  let tick = $state(0);

  $effect(() => {
    const session = terminal?.session;
    if (!session?.$state) {
      sessionState = "—";
      sessionError = null;
      return;
    }
    const teardownState = session.$state.subscribe((value) => (sessionState = value ?? "—"));
    const teardownError = session.$error?.subscribe?.((value) => (sessionError = value));
    const interval = setInterval(() => (tick += 1), 500);
    return () => {
      teardownState?.();
      teardownError?.();
      clearInterval(interval);
    };
  });

  $effect(() => {
    void tick;
    const ws = terminal?.socket?.ws ?? terminal?.socket;
    socketReady = typeof ws?.readyState === "number" ? READY_STATE[ws.readyState] : null;
  });

  let socketUrl = $derived(terminal?.socket?.url ?? thread?.mode?.connection?.url?.absolute ?? "—");
  let inboundShape = $derived(terminal?.session?.inboundShape ?? null);
  let outboundShape = $derived(terminal?.session?.outboundShape ?? null);
  let subscribers = $derived(terminal?.session?.subscribers ?? null);

  function flatten(shape, prefix = "") {
    if (!shape) return [];
    const paths = [];
    for (const leaf of shape.leaves ?? []) {
      paths.push(`${prefix}/${leaf.nature}`);
    }
    for (const [segment, sub] of Object.entries(shape.branches ?? {})) {
      paths.push(...flatten(sub, `${prefix}/${segment}`));
    }
    return paths;
  }

  let inboundPaths = $derived(flatten(inboundShape));
  let outboundPaths = $derived(flatten(outboundShape));
  let subscriberEntries = $derived.by(() => {
    if (!subscribers) return [];
    void tick;
    return [...subscribers.entries()].map(([signal, set]) => ({ signal, count: set.size }));
  });

  let hasInsituTrait = $derived(thread?.traits?.includes?.("INSITU") ?? false);
  let statusKind = $derived(
    sessionState === "LIVE" ? "live"
    : sessionState === "MOIN" ? "pulling"
    : sessionState === "ERROR" ? "error"
    : "stub",
  );

  async function engage() {
    if (!thread || !terminal || busy) return;
    busy = true;
    try {
      await terminal.engage(thread);
    } finally {
      busy = false;
    }
  }

  async function release() {
    if (!terminal || busy) return;
    busy = true;
    try {
      terminal.release();
    } finally {
      busy = false;
    }
  }
</script>

<Row letter="S" name="session" status={sessionState.toLowerCase()} {statusKind}>
  <div class="kv">
    <span class="k">state</span>
    <span class="states">
      {#each STATES as s, i}
        <span class="state" class:on={s === sessionState}>{s.toLowerCase()}</span>
        {#if i < STATES.length - 1}<span class="arrow">→</span>{/if}
      {/each}
    </span>
  </div>
  <div class="kv">
    <span class="k">trait</span>
    <span class="v">
      <span class="lamp" class:on={hasInsituTrait}></span>
      <span>{hasInsituTrait ? "INSITU enrolled" : "absent"}</span>
    </span>
  </div>
  <div class="kv">
    <span class="k">socket</span>
    <span class="v">
      <span class="lamp" class:on={socketReady === "open"}></span>
      <span class="muted small">{socketReady ?? "no socket"}</span>
      <code class="muted small">{socketUrl}</code>
    </span>
  </div>
  {#if sessionError}
    <div class="kv">
      <span class="k">error</span>
      <span class="v err">{sessionError.message ?? String(sessionError)}</span>
    </div>
  {/if}

  {#if inboundPaths.length}
    <div class="kv">
      <span class="k">inbound</span>
      <div class="paths">
        {#each inboundPaths as path}
          <code class="path">{path}</code>
        {/each}
      </div>
    </div>
  {/if}

  {#if outboundPaths.length}
    <div class="kv">
      <span class="k">outbound</span>
      <div class="paths">
        {#each outboundPaths as path}
          <code class="path">{path}</code>
        {/each}
      </div>
    </div>
  {/if}

  {#if subscriberEntries.length}
    <div class="kv">
      <span class="k">subscribers</span>
      <div class="paths">
        {#each subscriberEntries as entry}
          <code class="path">{entry.signal} <span class="muted small">· {entry.count}</span></code>
        {/each}
      </div>
    </div>
  {/if}

  {#snippet footer()}
    <button class="btn" onclick={engage} disabled={!thread || busy}>engage</button>
    <button class="btn" onclick={release} disabled={!terminal?.session || busy}>release</button>
  {/snippet}
</Row>

<style>
  .kv {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  .k {
    min-width: 80px;
    opacity: 0.5;
    padding-top: 2px;
  }
  .v {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
  }
  .states {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-wrap: wrap;
    font-size: 9px;
  }
  .state {
    opacity: 0.4;
    text-transform: lowercase;
  }
  .state.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .arrow {
    opacity: 0.25;
    font-size: 8px;
  }
  .lamp {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
  }
  .lamp.on {
    background: var(--colors-skeleton-0-primary-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-primary-base);
  }
  .paths {
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }
  .path {
    font: inherit;
    font-size: 8px;
    opacity: 0.7;
  }
  .err {
    color: var(--colors-skeleton-0-danger-base);
  }
  .muted {
    opacity: 0.4;
  }
  .small {
    font-size: 8px;
  }
  code {
    font: inherit;
    word-break: break-all;
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
