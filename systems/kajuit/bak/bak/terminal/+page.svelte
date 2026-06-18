<script>
  import { shape, steer } from "@vivalence/typology"
  import { skins } from "@vivalence/drapes"
  import { familiar } from "../cat.js"

  const { Terminal } = skins
  const { vector, state } = familiar()
  const pojo = $derived(shape.pojo(vector, steer.direct))
</script>

<h2>terminal</h2>
<Terminal {pojo} />

<style>
  h2 { font-size: 14px; margin: 0 0 16px; color: var(--colors-skeleton-0-primary-base); font-family: var(--font-family-code); }
</style>
