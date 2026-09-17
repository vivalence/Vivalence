<script>
  import { onDestroy } from "svelte";
  import { trace } from "@vivalence/typology";
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
  <div class="stream" bind:this={stream}>
    {#each rows as row, index (index)}
      <div class="row" class:milestone={!!row.message} class:failed={row.failed}>
        <span class="stamp">[{stamp(row.at)}]</span>
        <span class="bracket">
          {#if row.failed}[ FAIL ]{:else if row.message}[&nbsp;&nbsp;OK&nbsp;&nbsp;]{/if}
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
        {#if row.elapsed != null}<span class="ms">{row.elapsed.toFixed(0)}ms</span>{/if}
      </div>
    {/each}
  </div>
  <div class="gate-line">{gate}</div>
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
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
  }
  .stream {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    white-space: pre;
    opacity: 0.55;
  }
  .row.milestone {
    opacity: 1;
  }
  .stamp {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.35;
    flex-shrink: 0;
  }
  .bracket {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    min-width: 62px;
    flex-shrink: 0;
  }
  .row.failed .bracket {
    color: var(--colors-skeleton-0-danger-base);
  }
  .message {
    color: var(--colors-skeleton-1-contrast);
  }
  .row.failed .message {
    color: var(--colors-skeleton-0-danger-base);
  }
  .method {
    color: var(--colors-skeleton-2-contrast);
    min-width: 34px;
    flex-shrink: 0;
  }
  .target {
    color: var(--colors-skeleton-2-contrast);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .code {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.6;
  }
  .code.error {
    color: var(--colors-skeleton-0-danger-base);
    opacity: 1;
  }
  .tail {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.45;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ms {
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.35;
    margin-left: auto;
    flex-shrink: 0;
  }
  .gate-line {
    border-top: 1px solid var(--colors-skeleton-0-boundary);
    padding: 6px 20px;
    color: var(--colors-skeleton-2-contrast);
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }
</style>
