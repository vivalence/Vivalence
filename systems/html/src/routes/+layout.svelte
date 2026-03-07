<script>
  import "@vivalence/dapper/bsp.css";
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import "./+layout.css";
  // import "../design/primitives/bsp.css";
  // import "../design/primitives/font.css";


  import { Text, Pictogram } from "@vivalence/drapes";
  import { Shelve, Box } from "@vivalence/drapes";

  import { goto } from "$app/navigation";
  import client from "$client";
  import { lighthouse } from "$client";

  import { status, Ticker } from "@vivalence/html/surface";

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

<Shelve class="bsp-chain t-page bg-skeleton-app-surface ">
  <Box class="t-ticker border-b border-skeleton-1-boundary">
    <Ticker />
  </Box>

  <Box class="t-content">
    {@render children()}
  </Box>

</Shelve>
