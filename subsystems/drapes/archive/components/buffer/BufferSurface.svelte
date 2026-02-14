<script>
  import { mount, unmount } from "svelte";
  import { onMount, onDestroy } from "svelte";
  import { id } from "@vivalence/shared";
  import { Loader } from "@vivalence/drapes";

  let { stall } = $props();
  let component = $state(null);
  let dom = $state(null);
  let active = $derived.by(() => stall.active);

  // $inspect(dom, active);

  $effect(
    () =>
      dom &&
      active?.view?.url &&
      (async () => {
        // console.log("active.view.url", active.view.url);
        const module = await import(/* @vite-ignore */ active.view.url);
        // console.log("module", module);
        component?.destroy(), (component = null);
        component = module.default(dom, active.context);
      })(),
  );

  onMount(() => {
    stall.pull();
  });

  onDestroy(() => {
    component?.destroy();
  });
</script>

{#key id.id(active?.id)}
  {#if active?.view?.Component}
    <active.view.Component {...active.context} />
  {:else if active?.view?.url}
    <div id="buffer-container" class="bsp-node" bind:this={dom} />
  {:else}
    <!-- {:else if !component} -->
    <Loader time={{ minimum: 5000 }} load={() => stall.pull()} />
  {/if}
{/key}
