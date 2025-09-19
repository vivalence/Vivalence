<script>
  import "../app.css";
  import "../design/primitives/bsp.css";

  import { get, derived } from "svelte/store";
  import { Text, Modeline } from "@vivalence/interface";
  import { status } from "@client/views";
  import { lighthouses } from "@client/app";

  let { children } = $props();
</script>

<div class="bsp-chain-root bg-skeleton-app-surface t-modeline">
  <div class="bsp-node t-modeline-content">
    {@render children()}
  </div>

  <div class="bsp-node t-modeline-modeline">
    <Modeline>
      {#snippet center()}
        <Text>vivi pro finis</Text>
      {/snippet}
      {#snippet right()}
        {#each $lighthouses as lighthouse}
          <status.Dot
            status={lighthouse.connection.status}
            variant="simple"
            size="xs" />
        {/each}
      {/snippet}
    </Modeline>
  </div>
</div>
