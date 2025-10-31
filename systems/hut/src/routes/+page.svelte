<script>
  import { goto } from "$app/navigation";
  import { Text, Button, Input } from "@vivalence/surface";

  import { lighthouse } from "@client/app";
  import { lighthouse as view } from "@client/surface/views";

  let isIdentified = lighthouse.isIdentified;
</script>

{#if $isIdentified}
  {goto("/viva")}
{/if}

<div class="bsp-node h2 items-center px-24 debug-*">
  <div class="bsp-node h2 text-center">
    <Text weight="bold" size="2xl">home</Text>
  </div>
  <div class="bsp-node">
    <view.Login {lighthouse} />
  </div>
</div>
