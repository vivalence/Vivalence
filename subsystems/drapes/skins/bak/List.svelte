<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

  let results = $state({})

  function flatten(node, prefix = "") {
    const out = []
    for (const effect of node.effects) {
      out.push({ ...effect, path: prefix + effect.nature })
    }
    for (const trajectory of node.trajectories) {
      out.push({ ...trajectory, path: prefix + trajectory.nature, isGroup: true })
      if (trajectory.children) out.push(...flatten(trajectory.children, prefix + trajectory.nature + "/"))
    }
    return out
  }

  async function fire(item) {
    if (item.isGroup || !item.invoke) return
    try {
      results[item.path] = { ok: true, result: await item.invoke(defaults(item.signature?.input)) }
    } catch (error) {
      results[item.path] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-list">
  {#each flatten(pojo) as item}
    <div class="list-row" class:group={item.isGroup} onclick={() => fire(item)}>
      <span class="list-path">{item.path}</span>
      <span class="list-sep">·</span>
      {#if item.signature?.keyed}
        <span class="list-key">{item.signature.keyed.modifier ? item.signature.keyed.modifier + '+' : ''}{item.signature.keyed.command}</span>
      {/if}
      <span class="list-valence">{typeof item.signature?.valence === "string" ? item.signature.valence : item.signature?.valence?.name || ''}</span>
      {#if item.signature?.directed}
        <span class="list-directed">{item.signature.directed.icon}</span>
      {/if}
      {#if results[item.path]}<span class="list-result">{JSON.stringify(results[item.path].result)}</span>{/if}
    </div>
  {/each}
</div>

<style>
  .skin-list { font-family: var(--font-family-code); font-size: 11px; }
  .list-row { display: flex; align-items: center; gap: 6px; padding: 3px 8px; cursor: pointer; border-radius: 2px; }
  .list-row:hover { background: var(--colors-skeleton-1-surface); }
  .list-row.group { font-weight: 600; margin-top: 4px; cursor: default; }
  .list-path { color: var(--colors-skeleton-1-contrast); }
  .list-key { color: var(--colors-skeleton-0-primary-base); opacity: 0.6; font-size: 9px; }
  .list-sep { opacity: 0.2; }
  .list-valence { opacity: 0.4; }
  .list-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.4; font-size: 9px; }
  .list-result { margin-left: auto; color: var(--colors-skeleton-0-primary-base); opacity: 0.5; font-size: 9px; }
</style>
