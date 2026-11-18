<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

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

<div class="skin-card">
  <div class="card-grid">
    {#each pojo.effects as effect}
      <div class="card" onclick={() => fire(effect)}>
        <div class="card-nature">{effect.nature}</div>
        {#if effect.signature.keyed}
          <div class="card-key">{effect.signature.keyed.modifier ? effect.signature.keyed.modifier + '+' : ''}{effect.signature.keyed.command}</div>
        {/if}
        {#if typeof effect.signature.valence === "string"}
          <div class="card-valence">{effect.signature.valence}</div>
        {:else if effect.signature.valence?.name}
          <div class="card-valence">{effect.signature.valence.name}</div>
        {/if}
        {#if effect.signature.directed}
          <div class="card-directed">{effect.signature.directed.icon}</div>
        {/if}
        <div class="card-badges">
          {#if effect.signature.input}<span class="card-badge">in</span>{/if}
          {#if effect.signature.output}<span class="card-badge out">out</span>{/if}
        </div>
        {#if results[effect.nature]}<div class="card-result">{JSON.stringify(results[effect.nature].result)}</div>{/if}
      </div>
    {/each}
    {#each pojo.trajectories as trajectory}
      <div class="card trajectory">
        <div class="card-nature">{trajectory.nature}</div>
        {#if trajectory.signature.keyed}
          <div class="card-key">{trajectory.signature.keyed.modifier ? trajectory.signature.keyed.modifier + '+' : ''}{trajectory.signature.keyed.command}</div>
        {/if}
        {#if typeof trajectory.signature.valence === "string"}
          <div class="card-valence">{trajectory.signature.valence}</div>
        {:else if trajectory.signature.valence?.name}
          <div class="card-valence">{trajectory.signature.valence.name}</div>
        {/if}
        {#if trajectory.signature.directed}
          <div class="card-directed">{trajectory.signature.directed.icon}{#if trajectory.signature.directed.label} {trajectory.signature.directed.label}{/if}</div>
        {/if}
        {#if trajectory.children}
          <div class="card-children">
            {#each trajectory.children.effects as child}
              <button class="card-child" onclick={() => fire(child)}>
                {child.nature}
                {#if child.signature?.directed}<span class="child-directed">{child.signature.directed.icon}</span>{/if}
                {#if results[child.nature]}<span class="child-result">→ {JSON.stringify(results[child.nature].result)}</span>{/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .skin-card { font-family: var(--font-family-code); font-size: var(--font-size-sm); }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; }
  .card {
    padding: 10px; border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px; background: var(--colors-skeleton-1-surface);
    display: flex; flex-direction: column; gap: 4px; cursor: pointer;
  }
  .card:hover { border-color: var(--colors-skeleton-0-primary-base); }
  .card.trajectory { border-color: var(--colors-skeleton-0-primary-base); cursor: default; }
  .card-nature { font-weight: 600; }
  .card-key { color: var(--colors-skeleton-0-primary-base); font-size: var(--font-size-xs); }
  .card-valence { opacity: 0.5; font-size: var(--font-size-sm); }
  .card-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.4; font-size: var(--font-size-xs); }
  .card-badges { display: flex; gap: 4px; }
  .card-badge { font-size: var(--font-size-2xs); padding: 1px 4px; border-radius: 2px; background: var(--colors-skeleton-0-boundary); opacity: 0.5; }
  .card-badge.out { background: var(--colors-skeleton-0-primary-base); opacity: 0.3; }
  .card-result { font-size: var(--font-size-xs); color: var(--colors-skeleton-0-primary-base); opacity: 0.6; margin-top: 4px; }
  .card-children { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
  .card-child { font-size: var(--font-size-xs); padding: 2px 6px; background: var(--colors-skeleton-0-surface); border: 1px solid var(--colors-skeleton-0-boundary); border-radius: 2px; cursor: pointer; color: var(--colors-skeleton-1-contrast); font-family: inherit; }
  .card-child:hover { border-color: var(--colors-skeleton-0-primary-base); }
  .child-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.5; }
  .child-result { color: var(--colors-skeleton-0-primary-base); opacity: 0.6; }
</style>
