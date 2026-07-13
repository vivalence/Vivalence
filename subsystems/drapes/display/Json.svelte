<script>
  import Self from "./Json.svelte";

  let { value, name = null, depth = 0, openDepth = 2, maxDepth = 12, breadth = 100 } = $props();

  let expanded = $state(depth < openDepth);
  let showAll = $state(false);

  const array = $derived(Array.isArray(value));
  const object = $derived(
    value !== null && typeof value === "object" && !array && !(value instanceof Date),
  );
  const container = $derived(array || object);

  const entries = $derived.by(() => {
    if (array) return value.map((item, index) => [index, item]);
    if (object) return Object.entries(value);
    return [];
  });
  const visible = $derived(showAll ? entries : entries.slice(0, breadth));
  const overflow = $derived(entries.length - visible.length);

  const kind = $derived.by(() => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (array) return "array";
    if (value instanceof Date) return "date";
    if (object) return "object";
    return typeof value;
  });

  const preview = $derived(
    array ? `[ ${value.length} ]` : object ? `{ ${Object.keys(value).length} }` : "",
  );

  function copy(event) {
    event.stopPropagation();
    navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
  }
</script>

{#if container}
  <div class="node">
    <div class="row head" onclick={() => (expanded = !expanded)}>
      <span class="arrow" class:open={expanded}>▸</span>
      {#if name !== null}<span class="key">{name}</span><span class="colon">:</span>{/if}
      <span class="preview">{preview}</span>
      <button class="copy" onclick={copy} title="copy">⧉</button>
    </div>
    {#if expanded}
      <div class="children">
        {#if depth >= maxDepth}
          <span class="muted">…</span>
        {:else}
          {#each visible as [childName, child] (childName)}
            <Self name={childName} value={child} depth={depth + 1} {openDepth} {maxDepth} {breadth} />
          {/each}
          {#if overflow > 0}
            <button class="more" onclick={() => (showAll = true)}>{overflow} more…</button>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="row leaf">
    {#if name !== null}<span class="key">{name}</span><span class="colon">:</span>{/if}
    {#if value === null}
      <span class="val null">null</span>
    {:else if value === undefined}
      <span class="val muted">—</span>
    {:else if kind === "string"}
      <span class="val string">"{value}"</span>
    {:else if kind === "number" || kind === "bigint"}
      <span class="val number">{value}</span>
    {:else if kind === "boolean"}
      <span class="val boolean">{value}</span>
    {:else if kind === "date"}
      <span class="val date">{value.toISOString()}</span>
    {:else if kind === "function"}
      <span class="val muted">[fn {value.name || "anonymous"}]</span>
    {:else}
      <span class="val">{String(value)}</span>
    {/if}
    <button class="copy" onclick={copy} title="copy">⧉</button>
  </div>
{/if}

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 1px 4px 1px 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    line-height: 1.7;
    white-space: nowrap;
  }
  .head {
    cursor: pointer;
  }
  .head:hover,
  .leaf:hover {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 55%, transparent);
    border-radius: 3px;
  }
  .arrow {
    display: inline-block;
    width: 9px;
    flex-shrink: 0;
    opacity: 0.55;
    transition: transform 0.1s;
  }
  .arrow.open {
    transform: rotate(90deg);
  }
  .key {
    color: var(--colors-skeleton-1-contrast);
  }
  .colon {
    color: var(--colors-skeleton-1-boundary);
    margin-left: -2px;
    opacity: 0.7;
  }
  .preview {
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.75;
  }
  .children {
    padding-left: 11px;
    margin-left: 4px;
    border-left: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 22%, transparent);
  }
  .val.string {
    color: var(--colors-skeleton-0-success-base);
  }
  .val.number {
    color: var(--colors-skeleton-0-primary-base);
  }
  .val.boolean {
    color: var(--colors-skeleton-0-warning-base);
  }
  .val.null,
  .val.date,
  .muted {
    color: color-mix(in srgb, var(--colors-skeleton-1-boundary) 65%, transparent);
  }
  .copy {
    opacity: 0;
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    cursor: pointer;
    font-size: var(--font-size-2xs);
    padding: 0 2px;
    line-height: 1;
  }
  .row:hover .copy {
    opacity: 0.6;
  }
  .copy:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .more {
    border: none;
    background: transparent;
    color: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 1px 0 1px 11px;
    opacity: 0.8;
  }
  .more:hover {
    opacity: 1;
  }
</style>
