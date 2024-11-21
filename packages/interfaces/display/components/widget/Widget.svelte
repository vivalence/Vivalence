<script>
  import { onMount, unmount, onDestroy } from "svelte";

  const { bundle, payload } = $props();

  let component = $state(null);
  let target = $state(null);

  onMount(async () => {
    const { default: Component } = await import(/* @vite-ignore */ bundle);
    component = await Component(target, payload);
  });

  onDestroy(() => {
    component && unmount(component);
  });
</script>

<div class="bsp-node">
  <div id="widget-container" class="bsp-node" bind:this={target} />

  {#if !component}
    <div class="bsp-chain-end">
      <span class="text-theme-text-1">Loading component...</span>
    </div>
  {/if}
</div>
