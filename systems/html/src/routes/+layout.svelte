<script>
  import "@vivalence/dapper/bsp.css";
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import "./+layout.css";

  import { Text, Pictogram } from "@vivalence/drapes";
  import { Shelve, Box } from "@vivalence/drapes";

  import { goto } from "$app/navigation";
  import client from "$client";
  import { dataspace, lighthouse } from "$client";

  // import { Ticker } from "@vivalence/html/surface";

  let { children } = $props();
  let isIdentified = lighthouse.$isIdentified;
  let identity = lighthouse.$identity;
  // $inspect($isIdentified)
</script>

<div class="hidden">
  {#if !$isIdentified}
    {goto("/")}
  {/if}
</div>

<Shelve class="bsp-chain bg-skeleton-app-surface ">
  <!-- <Box class="t-ticker border-b border-skeleton-1-boundary"> <Ticker /> </Box> -->

    {@render children()}
  <!-- <Box class="t-content"> </Box> -->

</Shelve>
