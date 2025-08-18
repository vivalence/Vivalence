<script>
  import { Text } from "@vivalence/interface";
  import { runtimes } from "@client/authority";
  import { get } from "svelte/store";
  console.log(get(runtimes)[0]);

  // const link = (runtime, intent) =>
  //   "/viva" +
  //   `/runtime/${runtime.slug}` +
  //   intent.data.RESOLVED.path +
  //   `?intent=${intent.id}`;
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
  <div class="bsp-node">
    <!-- {#each user.runtimes as runtime} -->
    <!--   {#each runtime.intents as intent} -->
    <!--     <a href={link(runtime, intent)}> -->
    <!--       <Text color="text-palette-gray-100" size="xl"> -->
    <!--         {intent.data.RESOLVED.path} -->
    <!--       </Text> -->
    <!--     </a> -->
    <!--   {/each} -->
    <!-- {/each} -->
  </div>
</div>
