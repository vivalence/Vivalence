<script>
  import { onMount, onDestroy } from "svelte";

  const { bundle, ctx } = $props();

  let dismount = $state(null);
  let component = $state(null);
  let dom = $state(null);

  onMount(async () => {
    const { default: Component } = await import(/* @vite-ignore */ bundle);
    await Component(dom, ctx);
    component = true;
  });

  // @lj
  // deepClone fails. causes reactivity issues. props not isolated.
  // f.E. next updates state.active before previous game is unmounted
  // => game.call(/eval) happens to the wrong game
  onDestroy(() => {
    // Component unmounting not working.
    // @security lock.
    component = false;
  });
</script>

<div class="bsp-node">
  <div id="widget-container" class="bsp-node" bind:this={dom} />

  {#if !component}
    <div class="bsp-chain-end">
      <span class="text-theme-text-1">unknown widget.svelte error...</span>
    </div>
  {/if}
</div>
