<script>
  import { Text, Button } from "@vivalence/interface";
  import { Alert } from "@shadcn/components/ui/alert/index.js";
  import Discovery from "@client/components/discovery/Discovery.svelte";
  import { user } from "@client/app";

  // const { data } = $props();
  // const resolver = (intent) => {... goto(intent.resolution.path)}
  // const onSelect = (intent) => resolver(intent)
  // $intents = auth.user.intents
</script>

<div class="bsp-node container mx-auto flex flex-col items-center h-full">
  <div class="bsp-node text-center mb-8 mt-8">
    <Text
      variant="brand"
      color="text-palette-gray-200"
      class="opacity-80 drop-shadow-xl"
      weight="bold"
      size="8xl">VIVALENCE</Text>
  </div>
  <!-- {#each intent of user.intent} -->
  <!--   <Intent.SelectCard {intent} />  -->
  <!-- {/each} -->
</div>
