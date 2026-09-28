<script>
  import { onDestroy } from "svelte";
  import { trace } from "@vivalence/typology";
  import { Pip, Spinner } from "@vivalence/drapes";
  import { logger } from "$telemetry";

  let { gate } = $props();

  const pending = new Map();
  let stream = $state(null);

  const tail = (data) =>
    Object.entries(data ?? {})
      .filter(([key]) => key !== "message")
      .map(([key, value]) => `${key}=${typeof value === "object" ? JSON.stringify(value) : value}`)
      .join(" ");

  const append = (list, row) => [...list, row].slice(-500);

  const step = (list, record) => {
    if (record.verb === "open") {
      pending.set(record.span, { at: record.at });
      return list;
    }
    if (record.verb === "request" || record.verb === "response") {
      const held = pending.get(record.span);
      if (held) held.wire = { ...held.wire, ...record.data };
      return list;
    }
    if (record.verb === "close") {
      const held = pending.get(record.span);
      pending.delete(record.span);
      if (!held?.wire) return list;
      return append(list, { at: record.at, wire: held.wire, elapsed: record.at - held.at });
    }
    return append(list, {
      at: record.at,
      path: record.path,
      message: record.data?.message ?? null,
      tail: tail(record.data),
      failed: record.verb === "fault",
    });
  };

  const current = (story) => {
    const records = trace.dictate(story).sort((one, other) => one.at - other.at);
    const start = records.findLastIndex(
      (record) => record.path.endsWith("/authority") && record.verb === "open",
    );
    return start < 0 ? records : records.slice(start);
  };

  let rows = $state.raw(current(logger.$story.get()).reduce(step, []));

  const untap = logger.channel.tap((record) => (rows = step(rows, record)));
  onDestroy(untap);

  const stamp = (at) => (at / 1000).toFixed(3).padStart(8);

  $effect(() => {
    rows;
    if (stream) stream.scrollTop = stream.scrollHeight;
  });
</script>

<div class="boot">
  <div class="title">
    <Spinner />
    <span class="title-word">{gate}</span>
  </div>
  <div class="stream" bind:this={stream}>
    {#each rows as row, index (index)}
      <div class="entry" class:milestone={!!row.message} class:failed={row.failed}>
        <span class="stamp">[{stamp(row.at)}]</span>
        <span class="mark">
          {#if row.failed}<Pip size={6} tone="danger" />{:else if row.message}<Pip size={6} tone="success" />{/if}
        </span>
        {#if row.wire}
          <span class="method">{row.wire.method}</span>
          <span class="target">{row.wire.path}</span>
          {#if row.wire.status}
            <span class="code" class:error={row.wire.status >= 400}>{row.wire.status}</span>
          {/if}
        {:else}
          <span class="message">{row.message ?? row.path}</span>
        {/if}
        {#if row.tail}<span class="tail">{row.tail}</span>{/if}
        {#if row.elapsed != null}<span class="elapsed">{row.elapsed.toFixed(0)}ms</span>{/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .boot {
    display: flex;
    flex-direction: column;
    height: 100svh;
    box-sizing: border-box;
    padding-top: var(--safe-area-top, 0px);
    padding-bottom: var(--safe-area-bottom, 0px);
    padding-left: var(--safe-area-left, 0px);
    padding-right: var(--safe-area-right, 0px);
    background: var(--surface);
    color: var(--text-strong);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .title {
    flex: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px 10px;
    box-shadow: 0 var(--size-ring) 0 var(--boundary);
    color: var(--text-light);
  }
  .title-word {
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
  }
  .stream {
    flex: 1;
    overflow-y: auto;
    padding: 12px 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .entry {
    display: flex;
    gap: 8px;
    align-items: baseline;
    white-space: pre;
    color: var(--text-light);
  }
  .entry.milestone {
    color: var(--text-strong);
  }
  .entry.failed {
    color: var(--signal-negative-ink);
  }
  .stamp {
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .mark {
    display: inline-flex;
    justify-content: center;
    min-width: 14px;
    flex-shrink: 0;
  }
  .method {
    min-width: 34px;
    flex-shrink: 0;
  }
  .target {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .code.error {
    color: var(--signal-negative-ink);
  }
  .tail {
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .elapsed {
    color: var(--text-muted);
    margin-left: auto;
    flex-shrink: 0;
  }
</style>
