<script>
  import "../app.css";
  import "../design/primitives/bsp.css"; // IMPORTANT @ikiro
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

</script>

<div class="hidden">
{#if !$isIdentified}
  {goto("/")}
{/if}
</div>
<div class="bsp-chain-root bg-skeleton-app-surface t-modeline">
  <!-- @ikiro change this template from modeline (2split horizontal with upper split main and lower split modeline (thin/flat), we need a new template 'buffer' with a 6 split. first we split horizontally 3 times. one flat line called ticker, the main body called bauhaus, and our flat bottom line aka modeline). this gives us the buffer level. inside the structure that bauhaus gives us (this requires clever templating with bsp), we have the buffer level. buffer level is a full wrapping 100% container.  -->
  <buffer>
    <ticker>
      <!-- left: brand text `@vivalence/viva` white; center: logo icon square png: `vinca-viket-white.png`; left text '~' in systemspace text (poppins) in  discrete visibility. the whole thing vertically centered-->
    </ticker>
    <bauhaus>
      <!-- // children -->
    </bauhaus>
    <modeline>
      <!-- // same as currently. just better implementation.  -->
    </modeline>
  </buffer>
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
