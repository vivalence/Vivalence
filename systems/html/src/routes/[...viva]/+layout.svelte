<script>
  import { Text } from "@vivalence/drapes";
  import { dataspace } from "$client";
  // grip: bar | log
  // !handle auth.

  const valences = dataspace.valence.$entities;
  $inspect(valences);

  let { children } = $props();
</script>

<div
  class="bsp-node bg-skeleton-app-surface t-sidebar border-skeleton-1-boundary">
  <div class="bsp-node t-sidebar-sidebar">
    <div class="bsp-node t-grip">
      <div class="bsp-node t-grip-mesos xborder-b xborder-skeleton-1-boundary">
        <!-- <Text>mesos</Text> -->
        <!-- empty but layouted -->
      </div>
      <div class="bsp-node t-grip-active">
        {#each $valences.values() as valence}
          <a
            href={valence.destination.absolute}
            class="block p-2 hover:bg-skeleton-1-boundary">
            <Text size="sm" weight="medium">{valence.name}</Text>
            <Text size="xs" color="2" class="opacity-60">
              {valence.mode.slug}/{valence.slug}
            </Text>
          </a>
        {/each}
      </div>

      <div class="bsp-node t-grip-activities">
        <!-- <Text>active</Text> -->
        <!-- for dataspace valence render intent -->
      </div>
      <div class="bsp-node t-grip-client">
        <!-- <Text>client</Text> -->
        <!-- status, identity, xyz. -->
      </div>
    </div>
  </div>
  <div class="bsp-node t-sidebar-main">
    {@render children()}
  </div>
</div>

<style>
  .t-sidebar {
    display: grid;
    grid-template-columns: minmax(180px, 220px) 1fr;
    grid-template-rows: 100%;
    gap: 0;
  }

  .t-sidebar-sidebar {
    grid-column: 1;
    grid-row: 1;
  }

  .t-sidebar-main {
    grid-column: 2;
    grid-row: 1;
  }

  /* Grip layout: 4 vertical sections */
  .t-grip {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 200px 1fr 1fr 200px;
    gap: 0;
    height: 100%;
  }

  .t-grip-mesos {
    grid-column: 1;
    grid-row: 1;
  }

  .t-grip-active {
    grid-column: 1;
    grid-row: 2;
  }

  .t-grip-activities {
    grid-column: 1;
    grid-row: 3;
  }

  .t-grip-client {
    grid-column: 1;
    grid-row: 4;
  }
</style>
