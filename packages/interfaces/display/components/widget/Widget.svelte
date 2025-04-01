<script>
  import { onMount, onDestroy } from "svelte";

  const { bundle, ctx } = $props();

  let dismount = $state(null);
  let component = $state(null);
  let target = $state(null);

  onMount(async () => {
    const { default: Component } = await import(/* @vite-ignore */ bundle);
    await Component(target, ctx);
    component = true;
  });

  onDestroy(() => {
    // Component unmounting not working.
    // @security lock.
    component = false;
  });
</script>

<div class="bsp-node">
  <div id="widget-container" class="bsp-node" bind:this={target} />

  {#if !component}
    <div class="bsp-chain-end">
      <span class="text-theme-text-1">unknown widget.svelte error...</span>
    </div>
  {/if}
</div>
