<script>
  import { effect } from "nanostores";
  // import { path } from "@vivalence/typology";
  import { Text } from "@vivalence/drapes";
  import { remotes } from "$client";

  let daemons = remotes.daemon.$entities;
  // console.log({daemons})

  const link = (valence) => {
    const full = valence.mode.mount.branch(valence.resolve.generator).absolute;
    return "/viva" + full;
    // return new Path(paladin.mirror.mask.slug).stick(valence.entry).absolute; // where paladin.mirror is the mask of whatever system were in. lovely.
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
    {#each $daemons.values() as daemon}
      {#each daemon.entities.valence.$entities.value as valence}
        <a href={link(valence)}>
          <Text color="text-palette-gray-100">
            {daemon.manifest.slug}/{valence.module.type}/{valence.module.slug}: {valence.slug}
          </Text>
        </a>
      {/each}
    {/each}
  </div>
</div>

<!-- {#each daemon.entities.intent as intent} <a href={link(daemon, intent)}> <Text color="text-palette-gray-100" size="xl"> {intent.data.RESOLVED.path} </Text> </a> {/each} -->
