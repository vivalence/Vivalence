<script>
  // import { isIdentified, login, lighthouse } from "@client/app";
  import { Text } from "@vivalence/interface";
  // import { runtimes, logout } from "@client/app";

  // const link = (runtime, intent) => {
  //   return (
  //     "/viva" +
  //     `/runtime/${runtime.manifest.slug}` +
  //     intent.data.RESOLVED.path +
  //     `?intent=${intent.id}`
  //   );
  // };

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
    {#each runtimes.values() as runtime}
      <Text color="text-palette-gray-100" size="2xl">
        {runtime.manifest.slug}
      </Text>

      {#each runtime.entities.intent as intent}
        <a href={link(runtime, intent)}>
          <Text color="text-palette-gray-100" size="xl">
            {intent.data.RESOLVED.path}
          </Text>
        </a>
      {/each}
    {/each}
  </div>
</div>
