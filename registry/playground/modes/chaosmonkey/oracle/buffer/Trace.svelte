<script>
  import { trace } from "@vivalence/typology";
  import Trace from "./Trace.svelte";

  let { node, open = $bindable(false) } = $props();

  const ms = (value) => (value != null ? `${value.toFixed(0)}ms` : null);

  const leaf = $derived(node.path.split("/").filter(Boolean).pop() ?? "/");
  const trail = $derived(node.path.slice(0, Math.max(0, node.path.length - leaf.length)));
  const subject = $derived(node.entries.find((entry) => entry.verb === "subject")?.data);
  const wire = $derived(
    node.entries.find((entry) => entry.verb === "response")?.data ??
      node.entries.find((entry) => entry.verb === "request")?.data,
  );
  const notes = $derived(node.entries.filter((entry) => entry.verb === "note"));
  const expandable = $derived(notes.length > 0);

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

<div class="trace" class:fault={node.fault}>
  <button class="head" class:open onclick={() => (open = !open)} disabled={!expandable}>
    <span class="tick">{expandable ? (open ? "▾" : "▸") : "·"}</span>
    <span class="path"><span class="trail">{trail}</span><span class="leaf">{leaf}</span></span>
    {#if subject}<span class="badge">{subject.schema}{subject.id ? ":" + subject.id : ""}</span>{/if}
    {#if wire?.status}<span class="badge">{wire.status}</span>{/if}
    {#if ms(trace.duration(node))}<span class="dur">{ms(trace.duration(node))}</span>{/if}
  </button>
  {#if node.fault}
    <div class="fault-msg" title={node.fault.message}>
      {node.fault.code ? node.fault.code + " · " : ""}{node.fault.message}
    </div>
  {/if}
  {#if open && expandable}
    <pre class="body">{safe(notes.length === 1 ? notes[0].data : notes.map((entry) => entry.data))}</pre>
  {/if}
  {#if node.children.length}
    <div class="children">
      {#each node.children as child (child.id)}
        <Trace node={child} />
      {/each}
    </div>
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
  .children {
    margin-left: 14px;
    border-left: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  }
</style>
