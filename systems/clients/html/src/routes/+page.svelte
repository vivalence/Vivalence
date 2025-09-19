<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { Text, Button, Input } from "@vivalence/interface";

  import { lighthouses } from "@client/app";
  import { lighthouse } from "@client/views";

  // import ServiceStatus from "@client/interface/views/service/ServiceStatusCard.svelte";
</script>

<div class="bsp-node h2 items-center px-24 debug-*">
  <div class="bsp-node h2 text-center">
    <Text weight="bold" size="2xl">home</Text>
  </div>
  <div class="bsp-node">
    <lighthouse.Login lighthouse={$lighthouses[0]} />
  </div>
</div>
