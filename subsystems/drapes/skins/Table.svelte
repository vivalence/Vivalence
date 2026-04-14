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

<table class="skin-table">
  {#each nodes as node}
    <tr class="table-row" class:invocable={!!node.invoke} onclick={() => fire(node)}>
      <td class="table-key">{node.nature}</td>
      <td class="table-val">
        {#if typeof node.signature?.valence === "string"}
          {node.signature.valence}
        {:else if node.signature?.valence?.name}
          {node.signature.valence.name}
        {/if}
      </td>
      <td class="table-result">
        {#if results[node.nature]}{JSON.stringify(results[node.nature].result)}{/if}
      </td>
    </tr>
  {/each}
</table>

<style>
  .skin-table { width: 100%; border-collapse: collapse; font-family: var(--font-family-code); font-size: 11px; }
  .table-row td { padding: 2px 8px; }
  .table-row.invocable { cursor: pointer; }
  .table-row.invocable:hover { background: var(--colors-skeleton-1-surface); }
  .table-key { color: var(--colors-skeleton-2-contrast); white-space: nowrap; width: 1%; }
  .table-val { color: var(--colors-skeleton-0-primary-base); }
  .table-result { opacity: 0.4; font-size: 9px; }
</style>
