<script>
  import { defaults } from "./defaults.js"
  import Skin from "./Skin.svelte"

  let { nodes } = $props()

  let path = $state([])
  let results = $state({})

  const currentItems = $derived(() => {
    let items = nodes
    for (const segment of path) {
      const branch = items.find((n) => n.nature === segment && n.children)
      if (!branch) break
      items = branch.children
    }
    return items
  })

  const currentVariant = $derived(() => {
    let items = nodes
    let branch = null
    for (const segment of path) {
      branch = items.find((n) => n.nature === segment && n.children)
      if (!branch) break
      items = branch.children
    }
    return branch?.signature?.directed?.variant
  })

  function enter(nature) { path = [...path, nature] }
  function goTo(index) { path = path.slice(0, index) }

  async function fire(node) {
    const fullPath = [...path, node.nature].join("/")
    if (!node.invoke) return
    try {
      results[fullPath] = { ok: true, result: await node.invoke(defaults(node.signature?.input)) }
    } catch (error) {
      results[fullPath] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-breadcrumb">
  <div class="crumbs">
    <button class="crumb" onclick={() => goTo(0)}>root</button>
    {#each path as segment, i}
      <span class="crumb-sep">/</span>
      <button class="crumb" onclick={() => goTo(i + 1)}>{segment}</button>
    {/each}
  </div>

  {#if currentVariant() && currentVariant() !== "breadcrumb"}
    <Skin nodes={currentItems().filter((n) => !n.children)} variant={currentVariant()} />
    <div class="items">
      {#each currentItems().filter((n) => n.children) as node}
        <div class="bc-item branch" onclick={() => enter(node.nature)}>
          <span class="bc-nature">{node.nature}</span>
          {#if typeof node.signature?.valence === "string"}
            <span class="bc-valence">{node.signature.valence}</span>
          {:else if node.signature?.valence?.name}
            <span class="bc-valence">{node.signature.valence.name}</span>
          {/if}
          <span class="bc-arrow">→</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="items">
      {#each currentItems() as node}
        {#if node.children}
          <div class="bc-item branch" onclick={() => enter(node.nature)}>
            <span class="bc-nature">{node.nature}</span>
            {#if typeof node.signature?.valence === "string"}
              <span class="bc-valence">{node.signature.valence}</span>
            {:else if node.signature?.valence?.name}
              <span class="bc-valence">{node.signature.valence.name}</span>
            {/if}
            <span class="bc-arrow">→</span>
          </div>
        {:else}
          {@const fullPath = [...path, node.nature].join("/")}
          <div class="bc-item leaf" onclick={() => fire(node)}>
            <span class="bc-nature">{node.nature}</span>
            {#if typeof node.signature?.valence === "string"}
              <span class="bc-valence">{node.signature.valence}</span>
            {:else if node.signature?.valence?.name}
              <span class="bc-valence">{node.signature.valence.name}</span>
            {/if}
            {#if results[fullPath]}<span class="bc-result">{JSON.stringify(results[fullPath].result)}</span>{/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .skin-breadcrumb { font-family: var(--font-family-code); font-size: 11px; }
  .crumbs { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; padding: 0 4px; }
  .crumb { background: none; border: none; color: var(--colors-skeleton-0-primary-base); cursor: pointer; font-family: inherit; font-size: inherit; padding: 2px 4px; }
  .crumb:hover { text-decoration: underline; }
  .crumb-sep { opacity: 0.3; }
  .items { display: flex; flex-direction: column; gap: 1px; }
  .items { display: table; width: 100%; border-collapse: collapse; }
  .bc-item { display: table-row; cursor: pointer; }
  .bc-item:hover { background: var(--colors-skeleton-1-surface); }
  .bc-nature { display: table-cell; color: var(--colors-skeleton-1-contrast); padding: 2px 8px; white-space: nowrap; width: 1%; }
  .bc-valence { display: table-cell; color: var(--colors-skeleton-0-primary-base); opacity: 0.6; font-size: 9px; padding: 2px 8px; }
  .bc-arrow { display: table-cell; opacity: 0.4; padding: 2px 8px; width: 1%; }
  .bc-result { display: table-cell; opacity: 0.4; font-size: 9px; padding: 2px 8px; }
</style>
