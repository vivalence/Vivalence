<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/kajuit";
  import { Blacklist } from "@vivalence/typology";
  import { Stall } from "../../../typology/prototypes/stall.js";
  import { TERMINALS } from "$client";

  const terminals = getContext(TERMINALS);

  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const activeBuffer = chain(terminals, "$active", "$buffer");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");

  let busy = $state(false);

  const ordered = $derived([...($buffers ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)));
  const queueing = $derived($threadTraits?.includes("QUEUEING") ?? false);
  const aimed = $derived($threadTraits?.includes("AIMED") ?? false);
  const standalone = $derived($mode?.implements?.("STANDALONE") ?? false);

  async function mergePull(current, args) {
    const result = await current.pull(args);
    return Promise.all(
      (result.buffers ?? []).map((pojo) => current.daemon.entities.buffer.merge(pojo)),
    );
  }

  async function onCreate() {
    const terminal = terminals.active;
    const current = terminal?.thread;
    if (!current || busy) return;
    busy = true;
    try {
      if (current.traits.includes("AIMED")) {
        const created = await mergePull(current, {});
        if (created[0]) terminal.buffer = created[0];
      } else if (current.mode?.implements?.("STANDALONE")) {
        const { literal, literals, symbol, symbols, ...data } = current.trait?.MASKED ?? {};
        const buffer = await current.daemon.entities.buffer.create({
          mode: current.mode?.id ?? current.mode,
          thread: current.id,
          data,
          literals: [...(literals ?? []), ...(literal ? [literal] : [])],
          symbols: [...(symbols ?? []), ...(symbol ? [symbol] : [])],
        });
        terminal.buffer = buffer;
      }
    } finally {
      busy = false;
    }
  }

  function onStart() {
    const terminal = terminals.active;
    const current = terminal?.thread;
    if (!current) return;
    terminal.stall?.close?.();
    const stall = new Stall(current.$buffers, terminal.$buffer);
    stall.withPull(
      async () => {
        const merged = await mergePull(current, {
          blacklist: new Blacklist().absorb(current.$buffers.get()),
        });
        return { buffers: merged, condition: merged.length ? "NOMINAL" : "EXHAUSTED" };
      },
      current.trait?.QUEUEING?.depth ?? 1,
    );
    stall.activate();
    terminal.stall = stall;
  }

  function onStop() {
    const terminal = terminals.active;
    terminal?.stall?.close?.();
    if (terminal) terminal.stall = null;
  }

  function onActivate(buffer) {
    const terminal = terminals.active;
    if (!terminal) return;
    terminal.buffer = terminal.buffer?.id === buffer.id ? null : buffer;
  }

  async function onDelete(buffer) {
    const terminal = terminals.active;
    const repo = terminal?.thread?.daemon.entities.buffer;
    if (!repo) return;
    if (terminal.buffer?.id === buffer.id) terminal.buffer = null;
    repo.drop(buffer.id);
    try {
      await repo.removeOne({ id: buffer.id });
    } catch (error) {
      console.error("[f] buffer delete failed", error);
    }
  }

  async function onClear() {
    const terminal = terminals.active;
    const current = terminal?.thread;
    if (!current) return;
    const repo = current.daemon.entities.buffer;
    terminal.buffer = null;
    for (const buffer of ordered) repo.drop(buffer.id);
    try {
      await repo.remove({ thread: current.id });
    } catch (error) {
      console.error("[f] buffer clear failed", error);
    }
  }

  function modeLabel(buffer) {
    return buffer.mode?.slug ?? buffer.mode?.id ?? buffer.mode ?? "—";
  }
</script>

<div class="panel">
  <section class="factory">
    <header>factory</header>
    {#if !$thread}
      <div class="empty">no thread</div>
    {:else if queueing}
      <button class="act" onclick={onStart}>start</button>
      <button class="act" onclick={onStop}>stop</button>
    {:else if aimed}
      <button class="act primary" onclick={onCreate} disabled={busy}>
        {busy ? "…" : "create · emit"}
      </button>
    {:else if standalone}
      <button class="act primary" onclick={onCreate} disabled={busy}>
        {busy ? "…" : "create buffer"}
      </button>
    {:else}
      <button class="act" disabled title="this mode has no emitter — toggle AIMED to pull">
        aim required
      </button>
    {/if}
  </section>

  <section class="active">
    <header>active buffer</header>
    {#if !$activeBuffer}
      <div class="empty">none active</div>
    {:else}
      <div class="kv"><span class="k">mode</span><span class="v">{modeLabel($activeBuffer)}</span></div>
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
      <pre class="json">{JSON.stringify($activeBuffer.data ?? {}, null, 2)}</pre>
    {/if}
  </section>

  <section class="list">
    <header>
      buffers <span class="count">{ordered.length}</span>
      <button class="act danger" onclick={onClear} disabled={!ordered.length}>clear</button>
    </header>
    {#if !ordered.length}
      <div class="empty">no buffers</div>
    {:else}
      {#each ordered as buffer (buffer.id)}
        <div class="row" class:on={$activeBuffer?.id === buffer.id}>
          <button class="cell" onclick={() => onActivate(buffer)}>
            <span class="index">{buffer.index ?? 0}</span>
            <span class="status">{buffer.status ?? "PENDING"}</span>
            <span class="slug">{modeLabel(buffer)}</span>
          </button>
          <button class="x" onclick={() => onDelete(buffer)} title="delete">✕</button>
        </div>
      {/each}
    {/if}
  </section>
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
  }
  section {
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 50%, transparent);
    padding: 6px 10px 8px;
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.5;
    padding-bottom: 6px;
  }
  .count {
    opacity: 0.5;
  }
  .empty {
    opacity: 0.3;
    padding: 4px 0;
  }
  .factory {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .factory header {
    padding-bottom: 0;
  }
  .factory .act {
    align-self: flex-start;
  }
  .act {
    padding: 2px 9px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    cursor: pointer;
    opacity: 0.6;
  }
  .list header .act {
    margin-left: auto;
  }
  .act.primary {
    padding: 4px 12px;
    font-size: var(--font-size-2xs);
  }
  .act:hover:not(:disabled) {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .act.danger:hover:not(:disabled) {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  .act:disabled {
    opacity: 0.25;
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
    opacity: 0.6;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .row {
    display: flex;
    align-items: stretch;
  }
  .row.on {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 10%, transparent);
  }
  .row:hover {
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 25%, transparent);
  }
  .cell {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    text-align: left;
    cursor: pointer;
  }
  .index {
    opacity: 0.3;
    min-width: 12px;
    font-size: var(--font-size-2xs);
  }
  .status {
    padding: 0 4px;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    opacity: 0.6;
  }
  .slug {
    margin-left: auto;
    opacity: 0.5;
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
