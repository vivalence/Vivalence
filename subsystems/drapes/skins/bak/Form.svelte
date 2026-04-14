<script>
  let { pojo } = $props()

  let results = $state({})

  function fields(input) {
    if (!input?.properties) return []
    return Object.entries(input.properties).map(([name, schema]) => ({ name, type: schema.type || "string" }))
  }

  function allEffects(node, prefix = "") {
    const out = []
    for (const effect of node.effects) {
      out.push({ ...effect, path: prefix + effect.nature })
    }
    for (const trajectory of node.trajectories) {
      if (trajectory.children) {
        out.push(...allEffects(trajectory.children, prefix + trajectory.nature + "/"))
      }
    }
    return out
  }

  async function submit(effect, formData) {
    const data = {}
    for (const [k, val] of formData.entries()) {
      data[k] = val === "" ? 0 : isNaN(Number(val)) ? val : Number(val)
    }
    if (!effect.invoke) return
    try {
      const result = await effect.invoke(data)
      results[effect.path] = { ok: true, result }
    } catch (error) {
      results[effect.path] = { ok: false, error: error.message }
    }
  }
</script>

<div class="skin-form">
  {#each allEffects(pojo) as effect}
    {#if effect.signature?.input && fields(effect.signature.input).length > 0}
      <form class="effect-form" onsubmit={(e) => { e.preventDefault(); submit(effect, new FormData(e.target)) }}>
        <div class="form-label">{effect.path}</div>
        {#if typeof effect.signature.valence === "string"}
          <div class="form-valence">{effect.signature.valence}</div>
        {:else if effect.signature.valence?.prompt}
          <div class="form-valence">{effect.signature.valence.prompt}</div>
        {/if}
        {#each fields(effect.signature.input) as field}
          <div class="form-field">
            <label>{field.name}</label>
            <input name={field.name} type={field.type === "integer" || field.type === "number" ? "number" : "text"} step={field.type === "number" ? "0.1" : undefined} />
          </div>
        {/each}
        <button type="submit">invoke</button>
        {#if results[effect.path]}
          {@const r = results[effect.path]}
          <div class="form-result" class:error={!r.ok}>
            {r.ok ? JSON.stringify(r.result) : r.error}
          </div>
        {/if}
      </form>
    {/if}
  {/each}
</div>

<style>
  .skin-form { font-family: var(--font-family-code); font-size: 11px; }
  .effect-form { margin-bottom: 12px; padding: 10px; background: var(--colors-skeleton-1-surface); border-radius: 4px; border: 1px solid var(--colors-skeleton-0-boundary); }
  .form-label { font-weight: 600; margin-bottom: 2px; }
  .form-valence { opacity: 0.4; margin-bottom: 6px; font-size: 10px; }
  .form-field { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .form-field label { min-width: 70px; opacity: 0.6; }
  .form-field input { padding: 3px 6px; background: var(--colors-skeleton-0-surface); border: 1px solid var(--colors-skeleton-0-boundary); border-radius: 2px; color: var(--colors-skeleton-1-contrast); font-family: inherit; font-size: inherit; width: 120px; }
  button { margin-top: 6px; padding: 3px 12px; background: var(--colors-skeleton-0-boundary); border: none; border-radius: 2px; color: var(--colors-skeleton-1-contrast); font-family: inherit; font-size: inherit; cursor: pointer; }
  button:hover { opacity: 0.8; }
  .form-result { margin-top: 4px; color: var(--colors-skeleton-0-primary-base); opacity: 0.6; }
  .form-result.error { color: var(--colors-skeleton-0-danger-base, #f44); }
</style>
