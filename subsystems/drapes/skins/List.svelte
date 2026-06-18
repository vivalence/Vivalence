<script>
  import { defaults } from "./defaults.js"

  let { nodes } = $props()

  let results = $state({})

  async function fire(node) {
    if (!node.invoke) return
    try {
      results[node.nature] = { ok: true, result: await node.invoke(defaults(node.signature?.input)) }
    } catch (error) {
      results[node.nature] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-list">
  {#each nodes as node}
    <div class="list-item" class:invocable={!!node.invoke} onclick={() => fire(node)}>
      <span class="list-nature">{node.nature}</span>
      {#if node.signature?.valence?.prompt}
        <span class="list-prompt">{node.signature.valence.prompt}</span>
      {/if}
      {#if node.signature?.keyed}
        <span class="list-key">{node.signature.keyed.modifier ? node.signature.keyed.modifier + '+' : ''}{node.signature.keyed.command}</span>
      {/if}
      {#if results[node.nature]}<span class="list-result">{JSON.stringify(results[node.nature].result)}</span>{/if}
    </div>
  {/each}
</div>

<style>
  .skin-list { display: flex; flex-direction: column; font-family: var(--font-family-code); font-size: var(--font-size-xs); }
  .list-item {
    display: flex; gap: 8px; align-items: center; padding: 3px 10px;
    border-radius: 2px;
  }
  .list-item.invocable { cursor: pointer; }
  .list-item.invocable:hover { background: var(--colors-skeleton-1-surface); }
  .list-nature { color: var(--colors-skeleton-1-contrast); flex-shrink: 0; }
  .list-prompt { color: var(--colors-skeleton-2-contrast); opacity: 0.35; font-size: var(--font-size-2xs); }
  .list-key { color: var(--colors-skeleton-0-primary-base); font-size: var(--font-size-2xs); opacity: 0.4; margin-left: auto; flex-shrink: 0; }
  .list-result { opacity: 0.4; font-size: var(--font-size-2xs); }
</style>
