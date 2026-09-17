<script>
  import Self from "./Json.svelte";

  let { value, depth = 0, maxDepth = 8 } = $props();

  function isPlainObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);
  }

  function safeString(v) {
    try {
      return String(v);
    } catch {
      return "[unrenderable]";
    }
  }
</script>

{#if depth > maxDepth}
  <span class="muted">…</span>
{:else if value === null}
  <span class="prim null-val">null</span>
{:else if value === undefined}
  <span class="muted">—</span>
{:else if typeof value === "string"}
  <span class="prim string">"{value}"</span>
{:else if typeof value === "number" || typeof value === "bigint"}
  <span class="prim number">{safeString(value)}</span>
{:else if typeof value === "boolean"}
  <span class="prim boolean">{value}</span>
{:else if value instanceof Date}
  <span class="prim date">{value.toISOString()}</span>
{:else if Array.isArray(value)}
  {#if value.length === 0}
    <span class="muted">[]</span>
  {:else}
    <ul class="array">
      {#each value as item, index (index)}
        <li>
          <span class="index">{index}</span>
          <Self value={item} depth={depth + 1} {maxDepth} />
        </li>
      {/each}
    </ul>
  {/if}
{:else if isPlainObject(value)}
  {#if Object.keys(value).length === 0}
    <span class="muted">{`{}`}</span>
  {:else}
    <dl class="object">
      {#each Object.entries(value) as [key, child] (key)}
        <div class="entry">
          <dt>{key}</dt>
          <dd><Self value={child} depth={depth + 1} {maxDepth} /></dd>
        </div>
      {/each}
    </dl>
  {/if}
{:else if typeof value === "function"}
  <span class="prim fn">[fn {value.name || "anonymous"}]</span>
{:else}
  <span class="prim other">{safeString(value)}</span>
{/if}

<style>
  .prim {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
  }
  .string {
    color: var(--colors-skeleton-1-contrast);
  }
  .number {
    color: var(--colors-skeleton-0-primary-base);
  }
  .boolean {
    color: var(--colors-skeleton-0-warning-base);
  }
  .null-val,
  .date,
  .fn,
  .other {
    opacity: 0.6;
  }
  .muted {
    opacity: 0.35;
    font-size: var(--font-size-2xs);
  }
  .array,
  .object {
    margin: 0;
    padding: 0 0 0 10px;
    list-style: none;
    border-left: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 30%, transparent);
  }
  .array li {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    font-size: var(--font-size-2xs);
  }
  .index {
    opacity: 0.3;
    min-width: 14px;
    font-size: var(--font-size-2xs);
    padding-top: 1px;
  }
  .entry {
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }
  dt {
    opacity: 0.5;
    font-size: var(--font-size-2xs);
    min-width: 70px;
    padding-top: 1px;
  }
  dd {
    margin: 0;
    flex: 1;
    min-width: 0;
    word-break: break-word;
  }
</style>
