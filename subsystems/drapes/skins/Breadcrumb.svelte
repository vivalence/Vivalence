<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

  let path = $state([])
  let results = $state({})

  const current = $derived(() => {
    let node = pojo
    for (const segment of path) {
      const trajectory = node.trajectories.find((t) => t.nature === segment)
      if (!trajectory || !trajectory.children) break
      node = trajectory.children
    }
    return node
  })

  function enter(nature) { path = [...path, nature] }
  function goTo(index) { path = path.slice(0, index) }

  async function fire(effect) {
    const fullPath = [...path, effect.nature].join("/")
    if (!effect.invoke) return
    try {
      results[fullPath] = { ok: true, result: await effect.invoke(defaults(effect.signature?.input)) }
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
  <div class="items">
    {#each current().effects as effect}
      {@const fullPath = [...path, effect.nature].join("/")}
      <div class="bc-item leaf" onclick={() => fire(effect)}>
        <span class="bc-nature">{effect.nature}</span>
        {#if effect.signature?.keyed}
          <span class="bc-key">{effect.signature.keyed.modifier ? effect.signature.keyed.modifier + '+' : ''}{effect.signature.keyed.command}</span>
        {/if}
        {#if effect.signature?.directed}
          <span class="bc-directed">{effect.signature.directed.icon}</span>
        {/if}
        {#if results[fullPath]}<span class="bc-result">{JSON.stringify(results[fullPath].result)}</span>{/if}
      </div>
    {/each}
    {#each current().trajectories as trajectory}
      <div class="bc-item branch" onclick={() => enter(trajectory.nature)}>
        <span class="bc-nature">{trajectory.nature}</span>
        {#if trajectory.signature?.directed}
          <span class="bc-directed">{trajectory.signature.directed.icon}{#if trajectory.signature.directed.label} {trajectory.signature.directed.label}{/if}</span>
        {/if}
        <span class="bc-arrow">→</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .skin-breadcrumb { font-family: var(--font-family-code); font-size: 11px; }
  .crumbs { display: flex; align-items: center; gap: 4px; margin-bottom: 16px; }
  .crumb { background: none; border: none; color: var(--colors-skeleton-0-primary-base); cursor: pointer; font-family: inherit; font-size: inherit; padding: 2px 4px; }
  .crumb:hover { text-decoration: underline; }
  .crumb-sep { opacity: 0.3; }
  .items { display: flex; flex-direction: column; gap: 2px; }
  .bc-item { display: flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 2px; cursor: pointer; }
  .bc-item:hover { background: var(--colors-skeleton-1-surface); }
  .bc-nature { color: var(--colors-skeleton-1-contrast); }
  .bc-key { color: var(--colors-skeleton-0-primary-base); opacity: 0.5; font-size: 9px; }
  .bc-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.4; font-size: 9px; }
  .bc-arrow { opacity: 0.4; }
  .bc-result { opacity: 0.4; font-size: 9px; margin-left: auto; }
</style>
