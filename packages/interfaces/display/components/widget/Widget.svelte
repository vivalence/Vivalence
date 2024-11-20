<script>
  import { onMount, unmount, onDestroy } from "svelte";

  const { bundle, payload } = $props();

  let component = $state(null);
  let target = $state(null);

  onMount(async () => {
    const { default: Game } = await import(/* @vite-ignore */ bundle);
    component = await Game(target, payload);
  });

  onDestroy(() => {
    component && unmount(component);
  });
</script>

<div class="grid-chain-node">
  <div id="widget-container" class="grid-chain-node" bind:this={target} />

  {#if !component}
    <div class="grid-chain-end">
      <span class="text-theme-text-1">Loading component...</span>
    </div>
  {/if}
</div>
