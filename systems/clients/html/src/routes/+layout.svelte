<script>
  import "../app.css";
  import "../design/primitives/bsp.css";

  import { goto } from "$app/navigation";
  import { Text, Modeline } from "@vivalence/surface";
  import { status } from "@client/surface/views";
  import client from "@client/app";
  import { lighthouse } from "@client/app";
  import { effect } from "nanostores";

  let { children } = $props();

  let isIdentified = lighthouse.isIdentified;
  let identity = lighthouse.$identity;
</script>

{#if !$isIdentified}
  {goto("/")}
{/if}

<div class="bsp-chain-root bg-skeleton-app-surface t-modeline">
  <div class="bsp-node t-modeline-content">
    {@render children()}
  </div>

  <div class="bsp-node t-modeline-modeline">
    <Modeline>
      {#snippet left()}
        {#if $isIdentified}
          <Text>{$identity?.slug}</Text>
        {/if}
      {/snippet}
      {#snippet center()}
        <Text>vivi pro finis</Text>
      {/snippet}
      {#snippet right()}
        {#each client.remotes.$lighthouse as lighthouse}
          <status.Dot
            status={lighthouse.connection.status}
            variant="simple"
            size="xs" />
        {/each}
      {/snippet}
    </Modeline>
  </div>
</div>

<!-- <Text> {$identity?.id} {$isIdentified} </Text> -->
