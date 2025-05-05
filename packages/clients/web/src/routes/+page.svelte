<script>
  import { Text } from "@vivalence/interface";
  import { Alert } from "@client/shadcn/components/ui/alert/index.js";
  import Discovery from "@client/components/discovery/Discovery.svelte";
  
  const { data } = $props();
  const ctx = data.ctx;
</script>

<div class="container mx-auto flex flex-col items-center h-full">
  <div class="text-center mb-8 mt-8">
    <Text
      variant="brand"
      color="text-palette-gray-700"
      class="opacity-80 drop-shadow-xl"
      weight="bold"
      size="8xl">VIVALENCE</Text>
  </div>
  
  <div class="w-full max-w-2xl flex-grow">
    <Discovery {ctx} />
  </div>
</div>
