<script>
  import { defaults } from "./defaults.js"

  let { pojo, depth = 0 } = $props()

  let expanded = $state({})
  let results = $state({})

  const toggle = (key) => expanded[key] = !expanded[key]

  async function fire(node) {
    if (!node.invoke) return
    try {
      results[node.nature] = { ok: true, result: await node.invoke(defaults(node.signature.input)) }
    } catch (error) {
      results[node.nature] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-tree" style="--depth: {depth}">
  {#each pojo.effects as effect}
    <div class="tree-leaf" onclick={() => fire(effect)}>
      <span class="tree-nature">{effect.nature}</span>
      {#if effect.signature.keyed}
        <span class="tree-key">{effect.signature.keyed.modifier ? effect.signature.keyed.modifier + '+' : ''}{effect.signature.keyed.command}</span>
      {/if}
      {#if effect.signature.directed}
        <span class="tree-directed">{effect.signature.directed.icon}</span>
      {/if}
      {#if results[effect.nature]}<span class="tree-result">{JSON.stringify(results[effect.nature].result)}</span>{/if}
    </div>
  {/each}
  {#each pojo.trajectories as trajectory}
    <div class="tree-branch" onclick={() => toggle(trajectory.nature)}>
      <span class="tree-arrow" class:open={expanded[trajectory.nature]}>▸</span>
      <span class="tree-nature">{trajectory.nature}</span>
      {#if trajectory.signature.keyed}
        <span class="tree-key">{trajectory.signature.keyed.modifier ? trajectory.signature.keyed.modifier + '+' : ''}{trajectory.signature.keyed.command}</span>
      {/if}
      {#if trajectory.signature.directed}
        <span class="tree-directed">{trajectory.signature.directed.icon}{#if trajectory.signature.directed.label} {trajectory.signature.directed.label}{/if}{#if trajectory.signature.directed.collapsed} (collapsed){/if}</span>
      {/if}
    </div>
    {#if expanded[trajectory.nature] && trajectory.children}
      <svelte:self pojo={trajectory.children} depth={depth + 1} />
    {/if}
  {/each}
</div>

<style>
  .skin-tree { font-family: var(--font-family-code); font-size: 11px; padding-left: calc(var(--depth) * 6px); white-space: nowrap; overflow-x: auto; }
  .tree-leaf, .tree-branch { padding: 2px 0 2px 4px; display: flex; gap: 6px; align-items: center; cursor: pointer; }
  .tree-leaf:hover, .tree-branch:hover { background: var(--colors-skeleton-1-surface); border-radius: 2px; }
  .tree-arrow { display: inline-block; width: 10px; transition: transform 0.1s; flex-shrink: 0; }
  .tree-arrow.open { transform: rotate(90deg); }
  .tree-nature { color: var(--colors-skeleton-1-contrast); }
  .tree-key { color: var(--colors-skeleton-0-primary-base); opacity: 0.6; font-size: 9px; }
  .tree-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.4; font-size: 9px; }
  .tree-result { opacity: 0.4; font-size: 9px; }
</style>
