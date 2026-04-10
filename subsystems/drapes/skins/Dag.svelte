<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

  let results = $state({})
  let selected = $state(null)
  const graph = $derived(layout(pojo))

  const spacing = { x: 90, y: 60, child: 70, pad: 30 }

  function layout(node) {
    const nodes = []
    const edges = []
    const rootId = "root"

    const all = [...node.effects, ...node.trajectories]
    let maxX = 0
    let maxY = spacing.pad + spacing.y

    const totalWidth = all.length * spacing.x
    const cx = Math.max(totalWidth / 2 + spacing.pad, 120)
    nodes.push({ id: rootId, x: cx, y: spacing.pad, label: "·", isRoot: true })

    let x = cx - totalWidth / 2 + spacing.x / 2

    for (const item of all) {
      const id = item.nature
      const isTrajectory = !!item.children
      const y1 = spacing.pad + spacing.y
      nodes.push({ id, x, y: y1, label: item.nature, isTrajectory, signature: item.signature, node: item })
      edges.push({ from: rootId, to: id })
      if (x + spacing.pad > maxX) maxX = x + spacing.pad
      if (y1 + spacing.pad > maxY) maxY = y1 + spacing.pad

      if (item.children) {
        const childEffects = item.children.effects
        const childWidth = childEffects.length * spacing.child
        let childX = x - childWidth / 2 + spacing.child / 2
        const y2 = spacing.pad + spacing.y * 2
        for (const child of childEffects) {
          const cid = id + "/" + child.nature
          nodes.push({ id: cid, x: childX, y: y2, label: child.nature, signature: child.signature, node: child })
          edges.push({ from: id, to: cid })
          if (childX + spacing.pad > maxX) maxX = childX + spacing.pad
          if (y2 + spacing.pad > maxY) maxY = y2 + spacing.pad
          childX += spacing.child
        }
      }
      x += spacing.x
    }

    const width = Math.max(maxX, cx * 2)
    const height = maxY
    return { nodes, edges, width, height }
  }

  function nodePos(nodes, id) { return nodes.find((n) => n.id === id) }

  async function fire(graphNode) {
    if (!graphNode.node?.invoke) return
    selected = graphNode.id
    try {
      results[graphNode.id] = { ok: true, result: await graphNode.node.invoke(defaults(graphNode.signature?.input)) }
    } catch (error) {
      results[graphNode.id] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-dag">
  <svg viewBox="0 0 {graph.width} {graph.height}" width="100%" style="aspect-ratio: {graph.width} / {graph.height}">
    {#each graph.edges as edge}
      {@const from = nodePos(graph.nodes, edge.from)}
      {@const to = nodePos(graph.nodes, edge.to)}
      <line x1={from.x} y1={from.y + 8} x2={to.x} y2={to.y - 8} stroke="var(--colors-skeleton-0-boundary)" stroke-width="1" opacity="0.4" />
    {/each}
    {#each graph.nodes as graphNode}
      <circle
        cx={graphNode.x} cy={graphNode.y} r={graphNode.isRoot ? 4 : selected === graphNode.id ? 10 : 6}
        fill={selected === graphNode.id ? "var(--colors-skeleton-0-primary-base)" : graphNode.isTrajectory ? "var(--colors-skeleton-0-primary-base)" : "var(--colors-skeleton-0-boundary)"}
        opacity={graphNode.isRoot ? 0.6 : 0.8}
        style="cursor: {graphNode.isRoot ? 'default' : 'pointer'}; transition: r 0.1s"
        onclick={() => !graphNode.isRoot && fire(graphNode)}
      />
      {#if !graphNode.isRoot}
        <text
          x={graphNode.x} y={graphNode.y + 16}
          text-anchor="middle" fill="var(--colors-skeleton-1-contrast)"
          font-size="9" font-family="var(--font-family-code)"
          style="pointer-events: none"
        >{graphNode.label}</text>
      {/if}
      {#if results[graphNode.id]}
        <text
          x={graphNode.x} y={graphNode.y - 14}
          text-anchor="middle" fill="var(--colors-skeleton-0-primary-base)"
          font-size="8" font-family="var(--font-family-code)" opacity="0.6"
          style="pointer-events: none"
        >{JSON.stringify(results[graphNode.id].result)}</text>
      {/if}
    {/each}
  </svg>
</div>

<style>
  .skin-dag { font-family: var(--font-family-code); font-size: 11px; }
</style>
