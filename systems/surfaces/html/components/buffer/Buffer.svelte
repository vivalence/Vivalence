<script>
  import { mount, unmount } from "svelte";
  import { onMount, onDestroy } from "svelte";
  import { id } from "@vivalence/shared";
  import { Loader } from "@vivalence/surface";

  let { buffer } = $props();
  let component = $state(null);
  let dom = $state(null);
  let mode = $derived.by(() => buffer.active);

  $effect(
    () =>
      dom &&
      mode?.view?.url &&
      (async () => {
        const module = await import(/* @vite-ignore */ mode.view.url);
        component?.destroy(), (component = null);
        component = module.default(dom, mode.context);
      })(),
  );

  onMount(() => {
    buffer.pull();
  });

  onDestroy(() => {
    component?.destroy();
  });
</script>


{#key id(mode?.id)}
  {#if mode?.view?.Component}
    <Mode.view.Component {...mode.context} />
  {:else if mode?.view?.url}
    <div id="buffer-container" class="bsp-node" bind:this={dom} />
  {:else if !component}
    <Loader time={{ minimum: 5000 }} load={() => buffer.pull()} />
  {/if}
{/key}

