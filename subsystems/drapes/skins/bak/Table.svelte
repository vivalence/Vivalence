<script>
  import { defaults } from "./defaults.js"

  let { pojo } = $props()

  let results = $state({})

  function rows(node, prefix = "") {
    const out = []
    for (const effect of node.effects) {
      out.push({ ...effect, path: prefix ? prefix + "/" + effect.nature : effect.nature })
    }
    for (const trajectory of node.trajectories) {
      const path = prefix ? prefix + "/" + trajectory.nature : trajectory.nature
      out.push({ ...trajectory, path, isGroup: true })
      if (trajectory.children) out.push(...rows(trajectory.children, path))
    }
    return out
  }

  async function fire(row) {
    if (row.isGroup || !row.invoke) return
    try {
      results[row.path] = { ok: true, result: await row.invoke(defaults(row.signature?.input)) }
    } catch (error) {
      results[row.path] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-table">
  <table>
    <thead>
      <tr><th>path</th><th>keyed</th><th>valence</th><th>directed</th><th>input</th><th>output</th><th>result</th></tr>
    </thead>
    <tbody>
      {#each rows(pojo) as row}
        <tr class:group={row.isGroup} onclick={() => fire(row)}>
          <td class="cell-path">{row.path}</td>
          <td class="cell-key">{row.signature?.keyed ? (row.signature.keyed.modifier ? row.signature.keyed.modifier + '+' : '') + row.signature.keyed.command : ''}</td>
          <td class="cell-valence">{typeof row.signature?.valence === "string" ? row.signature.valence : row.signature?.valence?.name || ''}</td>
          <td class="cell-directed">{row.signature?.directed ? row.signature.directed.icon + (row.signature.directed.label ? ' ' + row.signature.directed.label : '') : ''}</td>
          <td class="cell-schema">{row.signature?.input?.properties ? Object.keys(row.signature.input.properties).join(', ') : ''}</td>
          <td class="cell-schema">{row.signature?.output?.properties ? Object.keys(row.signature.output.properties).join(', ') : ''}</td>
          <td class="cell-result">{results[row.path] ? JSON.stringify(results[row.path].result) : ''}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .skin-table { font-family: var(--font-family-code); font-size: var(--font-size-sm); }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 4px 8px; border-bottom: 1px solid var(--colors-skeleton-0-boundary); opacity: 0.5; }
  td { padding: 3px 8px; }
  tr { cursor: pointer; }
  tr:hover { background: var(--colors-skeleton-1-surface); }
  tr.group { opacity: 0.7; font-weight: 600; cursor: default; }
  .cell-path { color: var(--colors-skeleton-1-contrast); }
  .cell-key { color: var(--colors-skeleton-0-primary-base); }
  .cell-valence { opacity: 0.5; }
  .cell-directed { color: var(--colors-skeleton-0-primary-base); opacity: 0.4; }
  .cell-schema { opacity: 0.3; }
  .cell-result { color: var(--colors-skeleton-0-primary-base); opacity: 0.6; font-size: var(--font-size-xs); }
</style>
