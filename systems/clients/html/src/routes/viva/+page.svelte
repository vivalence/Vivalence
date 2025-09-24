<script>
  import { effect } from "nanostores";
  import { path } from "@vivalence/typology";
  import { Text } from "@vivalence/surface";
  import { remotes } from "@client/app";

  let runtimes = remotes.runtime.$entities;

  const link = (valence) => {
    const full = valence.module.path
      .branch(valence.resolve.generator)
      .collapse().value;

    return "/viva" + full;
  };
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
    {#each $runtimes.values() as runtime}
      {#each runtime.entities.valence.$entities.value as valence}
        <a href={link(valence)}>
          <Text color="text-palette-gray-100" >
        {runtime.manifest.slug}/{valence.module.type}/{valence.module.slug}: {valence.slug}
          </Text>
        </a>
      {/each}
    {/each}
  </div>
</div>

<!-- {#each runtime.entities.intent as intent} <a href={link(runtime, intent)}> <Text color="text-palette-gray-100" size="xl"> {intent.data.RESOLVED.path} </Text> </a> {/each} -->
