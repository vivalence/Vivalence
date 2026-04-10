<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

  let query = $state("")
  let results = $state({})

  function flatten(node, prefix = "") {
    const items = []
    for (const effect of node.effects) {
      items.push({ ...effect, path: prefix ? prefix + "/" + effect.nature : effect.nature })
    }
    for (const trajectory of node.trajectories) {
      const path = prefix ? prefix + "/" + trajectory.nature : trajectory.nature
      if (trajectory.children) items.push(...flatten(trajectory.children, path))
    }
    return items
  }

  const allItems = $derived(flatten(pojo))
  const filtered = $derived(query.length === 0 ? allItems : allItems.filter((item) => item.path.includes(query)))

  async function fire(item) {
    if (!item.invoke) return
    try {
      results[item.path] = { ok: true, result: await item.invoke(defaults(item.signature?.input)) }
    } catch (error) {
      results[item.path] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-palette">
  <input class="palette-input" type="text" placeholder="filter..." bind:value={query} />
  <div class="palette-list">
    {#each filtered as item}
      <div class="palette-item" onclick={() => fire(item)}>
        <span class="palette-path">{item.path}</span>
        {#if item.signature?.keyed}
          <span class="palette-key">{item.signature.keyed.modifier ? item.signature.keyed.modifier + '+' : ''}{item.signature.keyed.command}</span>
        {/if}
        {#if typeof item.signature?.valence === "string"}
          <span class="palette-valence">{item.signature.valence}</span>
        {:else if item.signature?.valence?.name}
          <span class="palette-valence">{item.signature.valence.name}</span>
        {/if}
        {#if results[item.path]}<span class="palette-result">{JSON.stringify(results[item.path].result)}</span>{/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .skin-palette { font-family: var(--font-family-code); font-size: 11px; }
  .palette-input {
    width: 100%; max-width: 400px; padding: 6px 10px; margin-bottom: 12px;
    background: var(--colors-skeleton-1-surface); border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 3px; color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code); font-size: 11px; outline: none;
  }
  .palette-list { display: flex; flex-direction: column; gap: 1px; }
  .palette-item {
    display: flex; gap: 12px; align-items: center; padding: 4px 8px;
    border-radius: 2px; cursor: pointer;
  }
  .palette-item:hover { background: var(--colors-skeleton-1-surface); }
  .palette-path { color: var(--colors-skeleton-1-contrast); min-width: 120px; }
  .palette-key { color: var(--colors-skeleton-0-primary-base); font-size: 9px; opacity: 0.7; min-width: 40px; }
  .palette-valence { opacity: 0.4; }
  .palette-result { opacity: 0.4; font-size: 9px; margin-left: auto; }
</style>
