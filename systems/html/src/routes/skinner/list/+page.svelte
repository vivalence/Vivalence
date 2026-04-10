<script>
  import { shape, steer } from "@vivalence/typology"
  import { skins } from "@vivalence/drapes"
  import { familiar } from "../cat.js"

  const { List: List } = skins
  const { vector, state } = familiar()
  const pojo = $derived(shape.pojo(vector, steer.direct))
</script>

<h2>list</h2>
<div class="state">energy:{state.energy} mana:{state.mana} mood:{state.mood} awareness:{state.awareness} alive:{state.alive}</div>
<List {pojo} />

<style>
  h2 { font-size: 14px; margin: 0 0 16px; color: var(--colors-skeleton-0-primary-base); font-family: var(--font-family-code); }
  .state { opacity: 0.4; font-family: var(--font-family-code); font-size: 11px; margin-bottom: 12px; }
</style>
