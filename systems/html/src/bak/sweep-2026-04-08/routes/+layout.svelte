<script>
  import "@vivalence/dapper/font.css";
  import "../client.css";
  import { onMount } from "svelte";
  import { lighthouse, discover } from "$client";
  import Login from "../lighthouse/Login.svelte";
  import { Loader } from "@vivalence/drapes";

  let { children } = $props();
  let ready = $state(false);
  let needsLogin = $state(false);

  async function boot() {
    await discover();
    ready = true;
  }

  onMount(async () => {
    const result = await lighthouse.verify();
    if (result.status === "OK") return boot();
    needsLogin = true;
  });
</script>

{#if ready}
  {@render children()}
{:else if needsLogin}
  <div class="gate">
    <Login {lighthouse} onConnected={boot} />
  </div>
{:else}
  <div class="gate">
    <Loader />
  </div>
{/if}

<style>
  .gate {
    display: grid;
    place-items: center;
    height: 100svh;
    background: var(--colors-skeleton-app-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-contrast);
  }
</style>
