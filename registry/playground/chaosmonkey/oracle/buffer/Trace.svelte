<script>
  let { record, open = $bindable(false) } = $props();

  const ms = (timing) =>
    timing?.begun != null && timing?.sealed != null ? `${(timing.sealed - timing.begun).toFixed(0)}ms` : null;

  const leaf = $derived(record.absolute.split("/").filter(Boolean).pop() ?? "/");
  const trail = $derived(record.absolute.slice(0, Math.max(0, record.absolute.length - leaf.length)));
  const body = $derived(record.object?.payload ?? record.transport ?? null);
  const expandable = $derived(body != null);

  function safe(value) {
    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (key, val) => {
        if (typeof val === "function") return `[fn ${val.name || "anonymous"}]`;
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) return "[circular]";
          seen.add(val);
        }
        return val;
      },
      2,
    );
  }
</script>

<div class="trace" class:fault={record.fault}>
  <button class="head" class:open onclick={() => (open = !open)} disabled={!expandable}>
    <span class="tick">{expandable ? (open ? "▾" : "▸") : "·"}</span>
    <span class="path"><span class="trail">{trail}</span><span class="leaf">{leaf}</span></span>
    {#if record.transition}<span class="badge">{record.transition.from} → {record.transition.to}</span>{/if}
    {#if record.transport?.response?.status}<span class="badge">{record.transport.response.status}</span>{/if}
    {#if record.subject}<span class="badge">{record.subject.schema}{record.subject.id ? ":" + record.subject.id : ""}</span>{/if}
    {#if ms(record.timing)}<span class="dur">{ms(record.timing)}</span>{/if}
  </button>
  {#if record.fault}
    <div class="fault-msg" title={record.fault.message}>
      {record.fault.code ? record.fault.code + " · " : ""}{record.fault.message}
    </div>
  {/if}
  {#if open && expandable}
    <pre class="body">{safe(body)}</pre>
  {/if}
</div>

<style>
  .trace {
    border-left: 2px solid transparent;
  }
  .trace.fault {
    border-left-color: var(--colors-skeleton-0-danger-base);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 3px 10px;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    text-align: left;
    cursor: pointer;
  }
  .head:disabled {
    cursor: default;
  }
  .head:not(:disabled):hover {
    background: color-mix(in srgb, currentColor 7%, transparent);
  }
  .tick {
    width: 1ch;
    opacity: 0.35;
  }
  .path {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .trail {
    opacity: 0.4;
  }
  .leaf {
    color: color-mix(in srgb, currentColor 92%, transparent);
  }
  .badge {
    padding: 0 6px;
    border-radius: 3px;
    background: color-mix(in srgb, currentColor 10%, transparent);
    color: color-mix(in srgb, currentColor 70%, transparent);
    white-space: nowrap;
  }
  .dur {
    margin-left: auto;
    opacity: 0.45;
    white-space: nowrap;
  }
  .fault-msg {
    margin: 0 10px 4px 22px;
    padding: 4px 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 12%, transparent);
    color: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 90%, white 10%);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    line-height: 1.4;
    max-height: 4.4em;
    overflow: hidden;
  }
  .body {
    margin: 0 10px 6px 22px;
    padding: 8px 10px;
    border-radius: 4px;
    background: color-mix(in srgb, currentColor 6%, transparent);
    color: color-mix(in srgb, currentColor 78%, transparent);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-x: auto;
  }
</style>
