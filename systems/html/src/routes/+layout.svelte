<script>
  import "../app.css";
  import "../design/primitives/bsp.css";
  import "../design/primitives/font.css";

  import { effect } from "nanostores";
  import { Text, Modeline } from "@vivalence/drapes";

  import client from "$hut";
  import { lighthouse } from "$hut";
  import { status } from "$hut/view";
  import { goto } from "$app/navigation";

  let { children } = $props();
  let isIdentified = lighthouse.isIdentified;
  let identity = lighthouse.$identity;

  // onMount(async () => await client.ikiro);

</script>

<div class="hidden">
{#if !$isIdentified}
  {goto("/")}
{/if}
</div>
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
