<script>
  import { defaults } from "./defaults.js"
  import Skin from "./Skin.svelte"

  let { nodes, depth = 0 } = $props()

  let expanded = $state({})
  let results = $state({})

  const toggle = (key) => expanded[key] = !expanded[key]

  async function fire(node) {
    if (!node.invoke) return
    try {
      results[node.nature] = { ok: true, result: await node.invoke(defaults(node.signature?.input)) }
    } catch (error) {
      results[node.nature] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-tree" style="--depth: {depth}">
  {#each nodes as node}
    {#if node.children}
      <div class="tree-branch" onclick={() => toggle(node.nature)}>
        <span class="tree-arrow" class:open={expanded[node.nature]}>▸</span>
        <span class="tree-nature">{node.nature}</span>
        {#if typeof node.signature?.valence === "string"}
          <span class="tree-valence">{node.signature.valence}</span>
        {:else if node.signature?.valence?.name}
          <span class="tree-valence">{node.signature.valence.name}</span>
        {/if}
        {#if node.signature?.keyed}
          <span class="tree-key">{node.signature.keyed.modifier ? node.signature.keyed.modifier + '+' : ''}{node.signature.keyed.command}</span>
        {/if}
        {#if node.signature?.directed}
          <span class="tree-directed">{node.signature.directed.icon}</span>
        {/if}
      </div>
      {#if expanded[node.nature]}
        <Skin nodes={node.children} variant={node.signature?.directed?.variant ?? "tree"} />
      {/if}
    {:else}
      <div class="tree-leaf" onclick={() => fire(node)}>
        <span class="tree-nature">{node.nature}</span>
        {#if typeof node.signature?.valence === "string"}
          <span class="tree-valence">{node.signature.valence}</span>
        {:else if node.signature?.valence?.name}
          <span class="tree-valence">{node.signature.valence.name}</span>
        {/if}
        {#if node.signature?.keyed}
          <span class="tree-key">{node.signature.keyed.modifier ? node.signature.keyed.modifier + '+' : ''}{node.signature.keyed.command}</span>
        {/if}
        {#if node.signature?.directed}
          <span class="tree-directed">{node.signature.directed.icon}</span>
        {/if}
        {#if results[node.nature]}<span class="tree-result">{JSON.stringify(results[node.nature].result)}</span>{/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .skin-tree { font-family: var(--font-family-code); font-size: var(--font-size-xs); padding-left: calc(var(--depth) * 6px); white-space: nowrap; overflow-x: auto; }
  .tree-leaf, .tree-branch { padding: 2px 0 2px 4px; display: flex; gap: 6px; align-items: center; cursor: pointer; }
  .tree-leaf:hover, .tree-branch:hover { background: var(--colors-skeleton-1-surface); border-radius: 2px; }
  .tree-arrow { display: inline-block; width: 10px; transition: transform 0.1s; flex-shrink: 0; }
  .tree-arrow.open { transform: rotate(90deg); }
  .tree-nature { color: var(--colors-skeleton-1-contrast); }
  .tree-key { color: var(--colors-skeleton-0-primary-base); opacity: 0.6; font-size: var(--font-size-2xs); }
  .tree-valence { color: var(--colors-skeleton-0-primary-base); opacity: 0.6; font-size: var(--font-size-2xs); margin-left: auto; }
  .tree-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.4; font-size: var(--font-size-2xs); }
  .tree-result { opacity: 0.4; font-size: var(--font-size-2xs); }
</style>
