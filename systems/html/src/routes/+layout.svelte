<script>
  import "@vivalence/dapper/bsp.css";
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import "./+layout.css";

  import { Text, Pictogram } from "@vivalence/drapes";
  import { Shelve, Box } from "@vivalence/drapes";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import client from "$client";
  import { dataspace, lighthouse } from "$client";

  let { children } = $props();
  let isIdentified = lighthouse.$isIdentified;
  let identity = lighthouse.$identity;
</script>

<div class="hidden">
  {#if !$isIdentified && $page.url.pathname !== "/"}
    {goto("/")}
  {/if}
</div>

<Shelve class="bsp-chain bg-skeleton-app-surface ">
  <!-- <Box class="t-ticker border-b border-skeleton-1-boundary"> <Ticker /> </Box> -->

    {@render children()}
  <!-- <Box class="t-content"> </Box> -->

</Shelve>
