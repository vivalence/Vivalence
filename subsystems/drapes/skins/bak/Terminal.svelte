<script>
  let { pojo } = $props()

  let input = $state("")
  let history = $state([{ type: "system", text: "skinner terminal. type <path> [args] or 'help'" }])

  function allPaths(node, prefix = "") {
    const out = []
    for (const effect of node.effects) out.push(prefix + effect.nature)
    for (const trajectory of node.trajectories) {
      out.push(prefix + trajectory.nature + "/")
      if (trajectory.children) out.push(...allPaths(trajectory.children, prefix + trajectory.nature + "/"))
    }
    return out
  }

  function findNode(node, path) {
    const segments = path.split("/")
    let current = node
    for (let i = 0; i < segments.length - 1; i++) {
      const trajectory = current.trajectories.find((t) => t.nature === segments[i])
      if (!trajectory?.children) return null
      current = trajectory.children
    }
    const leaf = segments[segments.length - 1]
    return current.effects.find((e) => e.nature === leaf)
  }

  async function execute() {
    const line = input.trim()
    input = ""
    if (!line) return
    history = [...history, { type: "input", text: line }]

    if (line === "help") {
      history = [...history, { type: "output", text: allPaths(pojo).join("\n") }]
      return
    }

    const effect = findNode(pojo, line)
    if (!effect?.invoke) {
      history = [...history, { type: "error", text: "not found: " + line }]
      return
    }

    try {
      const result = await effect.invoke({})
      history = [...history, { type: "output", text: JSON.stringify(result) }]
    } catch (error) {
      history = [...history, { type: "error", text: error.message }]
    }
  }
</script>

<div class="skin-terminal">
  <div class="term-output">
    {#each history as entry}
      <div class="term-line {entry.type}">{entry.text}</div>
    {/each}
  </div>
  <form class="term-form" onsubmit={(e) => { e.preventDefault(); execute() }}>
    <span class="term-prompt">›</span>
    <input class="term-input" bind:value={input} autofocus />
  </form>
</div>

<style>
  .skin-terminal { font-family: var(--font-family-code); font-size: var(--font-size-sm); display: flex; flex-direction: column; height: 100%; }
  .term-output { flex: 1; overflow-y: auto; padding-bottom: 8px; }
  .term-line { padding: 1px 0; white-space: pre-wrap; }
  .term-line.input { color: var(--colors-skeleton-0-primary-base); }
  .term-line.input::before { content: "› "; opacity: 0.4; }
  .term-line.output { opacity: 0.8; }
  .term-line.error { color: var(--colors-skeleton-0-danger-base, #f44); }
  .term-line.system { opacity: 0.4; }
  .term-form { display: flex; align-items: center; gap: 4px; border-top: 1px solid var(--colors-skeleton-0-boundary); padding-top: 8px; }
  .term-prompt { opacity: 0.4; }
  .term-input { flex: 1; background: none; border: none; color: var(--colors-skeleton-1-contrast); font-family: inherit; font-size: inherit; outline: none; }
</style>
