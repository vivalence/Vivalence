<script>
  import { AXES, avenues, contextLabel, origin, thinks } from "./intelligent.js";

  let { resolved = null, effort = undefined } = $props();
</script>

{#if resolved}
  <div class="faculty">
    <span class="faculty-type">{resolved.type}</span>
    {#if origin(resolved)}<span class="faculty-origin">{origin(resolved)}</span>{/if}
    <span class="faculty-fact">{contextLabel(resolved.context)}</span>
    <span class="faculty-fact" class:lit={thinks(resolved) && effort !== "none"}>
      {!thinks(resolved) ? "no thinking" : effort === "none" ? "thinking off" : "thinking"}
    </span>
    {#if avenues(resolved)}<span class="faculty-fact">{avenues(resolved)}</span>{/if}
  </div>
  <div class="axes">
    {#each AXES as axis, index (axis)}
      {@const value = resolved.tune?.[index] ?? 0}
      <span class="axis" title="{axis} {value.toFixed(1)}">
        <span class="axis-name">{axis}</span>
        <span class="axis-cells">
          {#each { length: 5 } as _, cell (cell)}
            <span class="axis-cell" class:full={value * 5 >= cell + 0.5}></span>
          {/each}
        </span>
      </span>
    {/each}
  </div>
{:else}
  <div class="faculty undecided">the mode decides</div>
{/if}

<style>
  .faculty {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 10px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .faculty.undecided {
    color: var(--text-light);
    font-style: italic;
  }
  .faculty-type {
    color: var(--signal-primary-ink);
  }
  .faculty-origin {
    color: var(--text-ink);
    overflow-wrap: anywhere;
  }
  .faculty-fact {
    color: var(--text-light);
  }
  .faculty-fact.lit {
    color: var(--signal-primary-ink);
  }
  .axes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
  }
  .axis {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }
  .axis-name {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .axis-cells {
    display: inline-flex;
    gap: 2px;
  }
  .axis-cell {
    width: 7px;
    height: 7px;
    border-radius: var(--shape-radius-xs);
    background: var(--boundary);
  }
  .axis-cell.full {
    background: var(--signal-primary);
  }
</style>
