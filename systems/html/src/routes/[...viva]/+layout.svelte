<script>
  import { Text } from "@vivalence/drapes";
  import { dataspace } from "$client";

  const valences = dataspace.valence.$entities;

  let { children } = $props();
</script>

<div class="bsp-node">
  {@render children()}
</div>
