<script>
  import "../app.css";
  import "../design/primitives/bsp.css";
  import "../design/primitives/font.css";

  import { effect } from "nanostores";
  import { Text, Modeline, Pictogram } from "@vivalence/drapes";

  import { goto } from "$app/navigation";
  import client from "$client";
  import { lighthouse } from "$client";

  import { status } from "@vivalence/html/surface";

  let { children } = $props();
  let isIdentified = lighthouse.isIdentified;
  let identity = lighthouse.$identity;
</script>

<div class="hidden">
  {#if !$isIdentified}
    {goto("/")}
  {/if}
</div>

<div class="bsp-chain-root bg-skeleton-app-surface t-buffer">
  <div class="bsp-node t-buffer-ticker">
    <Modeline size="sm">
      {#snippet left()}
        <Text variant="brand" color="white" size="sm" weight="medium">
          @vivalence/viva
        </Text>
      {/snippet}
      {#snippet center()}
        <Pictogram
          src="/images/pictogram_viket/pic-vinca-viket_white.png"
          alt="<<"
	  size="xl" />
      {/snippet}
      {#snippet right()}
        <Text variant="heading" size="xs" color="2" class="opacity-60">~</Text>
      {/snippet}
    </Modeline>
  </div>

  <div class="bsp-node t-buffer-content">
    {@render children()}
  </div>

  <div class="bsp-node t-buffer-modeline">
    <Modeline>
      <!-- {#snippet left()} {/snippet} -->
    </Modeline>
  </div>
</div>

<!-- <script> -->
<!--   import "../app.css"; -->
<!--   import "../design/primitives/bsp.css"; // IMPORTANT @ikiro -->
<!--   import "../design/primitives/font.css"; -->

<!--   import { effect } from "nanostores"; -->
<!--   import { Text, Modeline } from "@vivalence/drapes"; -->

<!--   import client from "$client"; -->
<!--   import { lighthouse } from "$client"; -->
<!--   import { status } from "$client/view"; -->
<!--   import { goto } from "$app/navigation"; -->

<!--   let { children } = $props(); -->
<!--   let isIdentified = lighthouse.isIdentified; -->
<!--   let identity = lighthouse.$identity; -->

<!-- </script> -->

<!-- <div class="hidden"> -->
<!-- {#if !$isIdentified} -->
<!--   {goto("/")} -->
<!-- {/if} -->
<!-- </div> -->
<!-- <div class="bsp-chain-root bg-skeleton-app-surface t-modeline"> -->
<!--   <\!-- @ikiro change this template from modeline (2split horizontal with upper split main and lower split modeline (thin/flat), we need a new template 'buffer' with a 6 split. first we split horizontally 3 times. one flat line called ticker, the main body called bauhaus, and our flat bottom line aka modeline). this gives us the buffer level. inside the structure that bauhaus gives us (this requires clever templating with bsp), we have the buffer level. buffer level is a full wrapping 100% container.  -\-> -->
<!--   <buffer> -->
<!--     <ticker> -->
<!--       <\!-- left: brand text `@vivalence/viva` white; center: logo icon square png: `vinca-viket-white.png`; left text '~' in systemspace text (poppins) in  discrete visibility. the whole thing vertically centered-\-> -->
<!--     </ticker> -->
<!--     <bauhaus> -->
<!--       <\!-- // children -\-> -->
<!--     </bauhaus> -->
<!--     <modeline> -->
<!--       <\!-- // same as currently. just better implementation.  -\-> -->
<!--     </modeline> -->
<!--   </buffer> -->
<!--   <div class="bsp-node t-modeline-content"> -->
<!--     {@render children()} -->
<!--   </div> -->

<!--   <div class="bsp-node t-modeline-modeline"> -->
<!--     <Modeline> -->
<!--       {#snippet left()} -->
<!--         {#if $isIdentified} -->
<!--           <Text>{$identity?.slug}</Text> -->
<!--         {/if} -->
<!--       {/snippet} -->
<!--       {#snippet center()} -->
<!--         <Text>vivi pro finis</Text> -->
<!--       {/snippet} -->
<!--       {#snippet right()} -->
<!--         {#each client.remotes.$lighthouse as lighthouse} -->
<!--           <status.Dot -->
<!--             status={lighthouse.connection.status} -->
<!--             variant="simple" -->
<!--             size="xs" /> -->
<!--         {/each} -->
<!--       {/snippet} -->
<!--     </Modeline> -->
<!--   </div> -->
<!-- </div> -->

<!-- <\!-- <Text> {$identity?.id} {$isIdentified} </Text> -\-> -->
