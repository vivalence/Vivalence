<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

  let results = $state({})
  let hovered = $state(null)

  const TAU = Math.PI * 2
  const OUTER = 130
  const RING2 = 190

  function arc(cx, cy, r, startAngle, endAngle) {
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  function slices(node) {
    const all = [...node.effects, ...node.trajectories]
    const step = TAU / all.length
    return all.map((item, i) => {
      const start = i * step - Math.PI / 2
      const end = start + step - 0.04
      const mid = (start + end) / 2
      return { ...item, start, end, mid, isTrajectory: !!item.children }
    })
  }

  async function fire(node) {
    if (!node.invoke) return
    try {
      results[node.nature] = { ok: true, result: await node.invoke(defaults(node.signature?.input)) }
    } catch (error) {
      results[node.nature] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-radial">
  {#if hovered}<div class="radial-tooltip">{hovered}</div>{/if}
  <svg viewBox="0 0 500 500" width="460" height="460">
    {#each slices(pojo) as slice}
      <path
        d={arc(250, 250, OUTER, slice.start, slice.end)}
        fill="none"
        stroke={hovered === slice.nature ? "var(--colors-skeleton-0-primary-base)" : slice.isTrajectory ? "var(--colors-skeleton-0-primary-base)" : "var(--colors-skeleton-0-boundary)"}
        stroke-width={hovered === slice.nature ? 22 : slice.isTrajectory ? 18 : 14}
        stroke-linecap="round"
        opacity={hovered === slice.nature ? 0.9 : 0.6}
        style="cursor: pointer; transition: stroke-width 0.1s"
        onmouseenter={() => hovered = slice.nature}
        onmouseleave={() => hovered = null}
        onclick={() => fire(slice)}
      />
      <text
        x={250 + (OUTER + 24) * Math.cos(slice.mid)}
        y={250 + (OUTER + 24) * Math.sin(slice.mid)}
        text-anchor="middle" dominant-baseline="middle"
        fill="var(--colors-skeleton-1-contrast)" font-size="10" font-family="var(--font-family-code)"
        style="pointer-events: none"
      >{slice.nature}</text>
      {#if slice.isTrajectory && slice.children}
        {#each slice.children.effects as child, j}
          {@const childStep = (slice.end - slice.start) / slice.children.effects.length}
          {@const childMid = slice.start + j * childStep + childStep / 2}
          <path
            d={arc(250, 250, RING2, slice.start + j * childStep + 0.02, slice.start + (j + 1) * childStep - 0.02)}
            fill="none"
            stroke={hovered === child.nature ? "var(--colors-skeleton-0-primary-base)" : "var(--colors-skeleton-0-boundary)"}
            stroke-width={hovered === child.nature ? 14 : 10}
            stroke-linecap="round"
            opacity={hovered === child.nature ? 0.8 : 0.4}
            style="cursor: pointer; transition: stroke-width 0.1s"
            onmouseenter={() => hovered = child.nature}
            onmouseleave={() => hovered = null}
            onclick={() => fire(child)}
          />
          <text
            x={250 + (RING2 + 16) * Math.cos(childMid)}
            y={250 + (RING2 + 16) * Math.sin(childMid)}
            text-anchor="middle" dominant-baseline="middle"
            fill="var(--colors-skeleton-1-contrast)" font-size="8" font-family="var(--font-family-code)"
            opacity="0.6" style="pointer-events: none"
          >{child.nature}</text>
        {/each}
      {/if}
    {/each}
    <circle cx="250" cy="250" r="70" fill="var(--colors-skeleton-0-surface)" stroke="var(--colors-skeleton-0-boundary)" stroke-width="1" />
    {#if hovered && results[hovered]}
      <text x="250" y="250" text-anchor="middle" dominant-baseline="middle" fill="var(--colors-skeleton-0-primary-base)" font-size="9" font-family="var(--font-family-code)">
        {JSON.stringify(results[hovered]?.result)}
      </text>
    {/if}
  </svg>
</div>

<style>
  .skin-radial { font-family: var(--font-family-code); font-size: var(--font-size-sm); }
  .radial-tooltip { position: fixed; top: 12px; right: 12px; padding: 4px 8px; background: var(--colors-skeleton-1-surface); border-radius: 3px; font-size: var(--font-size-sm); opacity: 0.7; }
</style>
