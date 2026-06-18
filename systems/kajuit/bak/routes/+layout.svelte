<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { Loader } from "@vivalence/drapes";

  let { children } = $props();
  let ready = $state(false);

  onMount(async () => {
    const client = await import("$client");
    const lighthouse = client.lighthouse;

    lighthouse.$isIdentified.subscribe((identified) => {
      if (!identified && $page.url.pathname !== "/") goto("/");
    });

    ready = true;
  });
</script>

{#if ready}
  {@render children()}
{:else}
  <Loader />
{/if}
